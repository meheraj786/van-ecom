import { api } from "@/lib/api";
import type { ContactFormValues } from "@/lib/validators";

export const contactService = {
  submitMessage: async (data: ContactFormValues) => {
    const response = await api.post("/contact-message", data);
    return response.data;
  },
};
