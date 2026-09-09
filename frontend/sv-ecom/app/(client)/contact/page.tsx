"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  Headphones,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  FaWhatsapp,
  FaFacebookMessenger,
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";
import { useTheme } from "@/hooks/useTheme";
import { contactFormSchema, type ContactFormValues } from "@/lib/validators";
import { contactService } from "@/services/contactService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const { data: themeData } = useTheme();

  const contactData = themeData?.contact || {};
  const socialLinks = themeData?.socialLinks || {};
  const chatConfig = themeData?.chat || {};
  const primaryColor = themeData?.primaryColor || "#111827";

  const title = contactData.title || "Get in Touch with e-com";
  const description =
    contactData.description ||
    "Have questions about our collections, sizing, delivery status, or custom orders? Our dedicated concierge team is here to assist you.";
  const email = contactData.mail || "support@e-com.com";
  const phone = contactData.phone || "+880 1700-000000";
  const address =
    contactData.address || "House 12, Road 5, Dhanmondi, Dhaka, Bangladesh";

  const whatsappNumber =
    chatConfig.whatsappNumber || phone.replace(/\D/g, "") || "8801700000000";
  const messengerUsername = chatConfig.messengerUsername || "luminastore";

  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: ContactFormValues) => contactService.submitMessage(data),
    onSuccess: () => {
      setIsSuccess(true);
      reset();
      setTimeout(() => setIsSuccess(false), 6000);
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    submitMutation.mutate(data);
  };

  return (
    <div
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="bg-[#FBFAF8] min-h-screen pt-8 pb-24"
    >
      <div className="border-b border-neutral-200/70">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-4 flex items-center text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <ChevronRight size={13} className="mx-2 text-neutral-300" />
          <span className="text-neutral-900 font-medium">Contact Us</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-12">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <Badge className="bg-neutral-900 text-white font-medium text-[11px] px-3.5 py-1 rounded-full border-none">
            Customer Support &bull; 24/7 Available
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight">
            {title}
          </h1>
          <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                <Headphones size={20} className="text-neutral-900" /> Official
                Channels
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <div className="h-11 w-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                      Support Hotline
                    </span>
                    <a
                      href={`tel:${phone}`}
                      className="text-sm font-bold text-neutral-900 hover:text-[var(--primary)] transition-colors block"
                    >
                      {phone}
                    </a>
                    <span className="text-xs text-neutral-500 block">
                      Available Sat - Thu (9:00 AM - 10:00 PM)
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <div className="h-11 w-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                      Email Inquiries
                    </span>
                    <a
                      href={`mailto:${email}`}
                      className="text-sm font-bold text-neutral-900 hover:text-[var(--primary)] transition-colors block"
                    >
                      {email}
                    </a>
                    <span className="text-xs text-neutral-500 block">
                      Guaranteed response within 2 hours
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <div className="h-11 w-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                      Store &amp; Headquarters
                    </span>
                    <p className="text-sm font-bold text-neutral-900 leading-snug">
                      {address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <span className="text-xs font-bold text-neutral-900 block">
                  Instant Messaging Support
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                      "Hello e-com Support, I would like to inquire about...",
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white font-bold text-xs transition-all"
                  >
                    <FaWhatsapp size={16} /> WhatsApp
                  </a>

                  <a
                    href={`https://m.me/${messengerUsername.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#0084FF]/10 text-[#0084FF] hover:bg-[#0084FF] hover:text-white font-bold text-xs transition-all"
                  >
                    <FaFacebookMessenger size={15} /> Messenger
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500">
                  Follow Our Socials
                </span>
                <div className="flex items-center gap-2">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-900 hover:text-white transition-colors"
                    >
                      <FaFacebookF size={12} />
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-900 hover:text-white transition-colors"
                    >
                      <FaInstagram size={13} />
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-900 hover:text-white transition-colors"
                    >
                      <FaYoutube size={13} />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-900 hover:text-white transition-colors"
                    >
                      <FaTwitter size={13} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  Send Us a Direct Message
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  Fill out the form below and our customer relations team will
                  contact you shortly.
                </p>
              </div>

              {isSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
                  <CheckCircle2
                    size={20}
                    className="text-emerald-600 shrink-0"
                  />
                  <p className="text-xs sm:text-sm font-semibold">
                    Thank you! Your message has been sent successfully. We will
                    reply to your email soon.
                  </p>
                </div>
              )}

              {submitMutation.isError && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 animate-in fade-in">
                  <AlertCircle size={20} className="text-red-600 shrink-0" />
                  <p className="text-xs sm:text-sm font-semibold">
                    Failed to submit message. Please try again or reach us on
                    WhatsApp.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. John Doe"
                      {...register("name")}
                      className={cn(
                        "h-11 rounded-2xl text-xs bg-neutral-50/50",
                        errors.name
                          ? "border-red-500 focus:ring-red-100"
                          : "border-neutral-200",
                      )}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-red-500 font-medium ml-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="e.g. john@example.com"
                      {...register("email")}
                      className={cn(
                        "h-11 rounded-2xl text-xs bg-neutral-50/50",
                        errors.email
                          ? "border-red-500 focus:ring-red-100"
                          : "border-neutral-200",
                      )}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-500 font-medium ml-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Mobile Number
                    </label>
                    <Input
                      placeholder="e.g. +880 1700-000000"
                      {...register("phone")}
                      className={cn(
                        "h-11 rounded-2xl text-xs font-mono bg-neutral-50/50",
                        errors.phone
                          ? "border-red-500 focus:ring-red-100"
                          : "border-neutral-200",
                      )}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-500 font-medium ml-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Subject / Order ID
                    </label>
                    <Input
                      placeholder="e.g. Order #1234 Inquiry"
                      {...register("subject")}
                      className="h-11 rounded-2xl text-xs bg-neutral-50/50 border-neutral-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="How can we help you? Describe your inquiry in detail..."
                    {...register("message")}
                    className={cn(
                      "rounded-2xl text-xs min-h-[140px] bg-neutral-50/50",
                      errors.message
                        ? "border-red-500 focus:ring-red-100"
                        : "border-neutral-200",
                    )}
                  />
                  {errors.message && (
                    <p className="text-[11px] text-red-500 font-medium ml-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full h-12 rounded-full font-bold text-xs uppercase tracking-wider bg-neutral-900 text-white hover:bg-black transition-all cursor-pointer shadow-md gap-2 mt-2"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Submit Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
