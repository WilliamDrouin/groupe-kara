import { useState, useRef } from "react";
import { z } from "zod";

const schema = z.object({
  nom: z.string().min(2, "Veuillez entrer votre nom complet."),
  email: z.string().email("Cette adresse courriel ne semble pas valide."),
  telephone: z.string().optional().or(z.literal("")),
  secteur: z.string().min(2, "Veuillez indiquer votre secteur d'activité."),
  message: z
    .string()
    .min(20, "Merci de nous en dire un peu plus (20 caractères minimum)."),
});

type FormData = z.infer<typeof schema>;
type FieldErrors = Partial<Record<keyof FormData, string>>;
type Status = "idle" | "loading" | "success";

const EMPTY: FormData = {
  nom: "",
  email: "",
  telephone: "",
  secteur: "",
  message: "",
};

const inputBase =
  "w-full bg-[#0F0F0F] border text-[#E8E8E8] font-sans text-sm px-4 py-3.5 placeholder-[#3A3A3A] transition-all duration-300 outline-none focus:border-[#D4AF37]/60 focus:bg-[#111111]";

const labelBase =
  "block font-sans text-[10px] tracking-[0.3em] uppercase text-[#555555] mb-2";

export default function ContactForm() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormData;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1600));

    // Demo mode — no real email sent
    // Production: POST to /api/contact with Resend

    setStatus("success");
    setForm(EMPTY);
    setErrors({});

    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setStatus("idle"), 6000);
  };

  const fieldClass = (name: keyof FormData) =>
    `${inputBase} ${errors[name] ? "border-red-800/60" : "border-[#1E1E1E]"}`;

  return (
    <div className="relative">
      {/* Success toast */}
      <div
        className={`fixed top-6 right-6 z-[100] flex items-start gap-3 bg-[#111111] border border-[#D4AF37]/30 px-5 py-4 max-w-sm shadow-2xl transition-all duration-500 ${
          status === "success"
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
        role="status"
        aria-live="polite"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="flex-shrink-0 mt-0.5"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="8" stroke="#D4AF37" strokeWidth="1.2" />
          <path
            d="M5.5 9L7.5 11L12 6.5"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <p className="font-sans text-xs font-medium text-[#E8E8E8] mb-0.5">
            Message reçu
          </p>
          <p className="font-sans text-xs text-[#666666] leading-relaxed">
            Merci. Nous vous contacterons dans les 24h en toute confidentialité.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Nom + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="nom" className={labelBase}>
              Nom complet <span className="text-[#D4AF37]">*</span>
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              autoComplete="name"
              value={form.nom}
              onChange={handleChange}
              placeholder="Jean Tremblay"
              className={fieldClass("nom")}
            />
            {errors.nom && (
              <p className="mt-1.5 font-sans text-[10px] text-red-500/80">
                {errors.nom}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className={labelBase}>
              Courriel <span className="text-[#D4AF37]">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jean@entreprise.com"
              className={fieldClass("email")}
            />
            {errors.email && (
              <p className="mt-1.5 font-sans text-[10px] text-red-500/80">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Téléphone + Secteur */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="telephone" className={labelBase}>
              Téléphone{" "}
              <span className="text-[#3A3A3A] normal-case tracking-normal">
                (optionnel)
              </span>
            </label>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              autoComplete="tel"
              value={form.telephone}
              onChange={handleChange}
              placeholder="514 000-0000"
              className={fieldClass("telephone")}
            />
          </div>

          <div>
            <label htmlFor="secteur" className={labelBase}>
              Secteur d'activité <span className="text-[#D4AF37]">*</span>
            </label>
            <input
              id="secteur"
              name="secteur"
              type="text"
              value={form.secteur}
              onChange={handleChange}
              placeholder="Ex: Plomberie, Restauration..."
              className={fieldClass("secteur")}
            />
            {errors.secteur && (
              <p className="mt-1.5 font-sans text-[10px] text-red-500/80">
                {errors.secteur}
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className={labelBase}>
            Votre situation <span className="text-[#D4AF37]">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={form.message}
            onChange={handleChange}
            placeholder="Parlez-nous brièvement de votre entreprise et de ce que vous envisagez..."
            className={`${fieldClass("message")} resize-none`}
          />
          {errors.message && (
            <p className="mt-1.5 font-sans text-[10px] text-red-500/80">
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center justify-center gap-3 bg-[#D4AF37] text-[#0A0A0A] font-sans text-xs tracking-widest uppercase px-10 py-4 transition-all duration-300 hover:bg-[#E8C84A] disabled:opacity-60 disabled:cursor-not-allowed min-w-[240px]"
          >
            {status === "loading" ? (
              <>
                <svg
                  className="animate-spin"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="7"
                    cy="7"
                    r="5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="20"
                    strokeDashoffset="10"
                  />
                </svg>
                Envoi en cours...
              </>
            ) : (
              "Envoyer ma demande"
            )}
          </button>

          <p className="font-sans text-[10px] text-[#3A3A3A] tracking-wide">
            Vos informations restent entre nous.
          </p>
        </div>
      </form>
    </div>
  );
}
