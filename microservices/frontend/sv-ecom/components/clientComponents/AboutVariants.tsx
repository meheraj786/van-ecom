"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Users,
  Sparkles,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/useThemeStore";

const defaultAboutPage = {
  badge: "Since 2019",
  heading: "Designing everyday",
  highlightText: "essentials",
  headingSuffix: "that last.",
  intro:
    "We started with a simple question: why does buying something that lasts have to mean giving up on good design? Today we work with a small group of makers who share that belief, building pieces meant to be used — not just unboxed.",
  mission: {
    title: "Our mission",
    body: "To make thoughtfully designed, genuinely durable goods accessible without the premium markup that usually comes with them. Every product goes through the same question before it ships: would we still want this in five years?",
  },
  stats: [
    { label: "Founded", value: "2019" },
    { label: "Orders shipped", value: "120K+" },
    { label: "Countries served", value: "24" },
    { label: "Average rating", value: "4.8/5" },
  ],
  values: [
    {
      icon: "Leaf",
      title: "Sustainable by default",
      description:
        "Responsibly sourced materials and packaging that doesn't end up as waste the same week it arrives.",
    },
    {
      icon: "ShieldCheck",
      title: "Built to last",
      description:
        "Every piece is stress-tested well past what a normal return policy would ever require of it.",
    },
    {
      icon: "Users",
      title: "Community first",
      description:
        "Product decisions start from customer feedback, not the other way around.",
    },
    {
      icon: "Sparkles",
      title: "Considered design",
      description:
        "Nothing ships until it earns its place — no filler, no unnecessary variants.",
    },
  ],
  timeline: [
    {
      year: "2019",
      title: "The idea",
      description:
        "Started in a spare room with one product and a long list of frustrations with the alternatives.",
    },
    {
      year: "2021",
      title: "First storefront",
      description:
        "Opened our first small studio space and shipped our 10,000th order.",
    },
    {
      year: "2023",
      title: "Going global",
      description:
        "Expanded shipping to 24 countries and grew the team to twenty people.",
    },
    {
      year: "2025",
      title: "Today",
      description:
        "Still run by the same small team, still asking the same question about every product.",
    },
  ],
  team: [
    {
      name: "Amara Chowdhury",
      role: "Founder & CEO",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400",
    },
    {
      name: "Rafi Islam",
      role: "Head of Design",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
    },
    {
      name: "Nadia Karim",
      role: "Operations Lead",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
    },
    {
      name: "Tanvir Ahmed",
      role: "Customer Experience",
      image:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400",
    },
  ],
  quote: {
    text: "We'd rather ship four things a year that we're proud of than forty that we're not.",
    author: "Amara Chowdhury, Founder",
  },
  cta: {
    title: "Join the journey.",
    description:
      "Shop the current collection, or reach out if you'd like to work with us.",
    primaryBtn: "Shop the collection",
    secondaryBtn: "Get in touch",
  },
};

const iconMap = {
  Leaf,
  ShieldCheck,
  Users,
  Sparkles,
} as const;

function useAboutTheme() {
  const { primaryColor, theme } = useThemeStore();
  const aboutPage = (theme?.aboutPage || defaultAboutPage) as any;
  const dynamicStyles = { "--primary": primaryColor } as React.CSSProperties;
  return { primaryColor, aboutPage, dynamicStyles };
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function About1() {
  const { primaryColor, aboutPage: c, dynamicStyles } = useAboutTheme();

  return (
    <div style={dynamicStyles} className="bg-[#f8f9fb] pt-32 pb-24">
      <section className="lg:w-3/4 mx-auto px-8 text-center">
        <motion.span
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full inline-block"
          style={{
            color: "var(--primary)",
            backgroundColor: `${primaryColor}15`,
          }}
        >
          {c.badge}
        </motion.span>
        <motion.h1
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-6 text-5xl md:text-7xl font-serif leading-tight text-gray-900 max-w-3xl mx-auto"
        >
          {c.heading}{" "}
          <span
            className="italic font-light"
            style={{ color: "var(--primary)" }}
          >
            {c.highlightText}
          </span>{" "}
          {c.headingSuffix}
        </motion.h1>
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed"
        >
          {c.intro}
        </motion.p>
      </section>

      <section className="lg:w-3/4 mx-auto px-8 mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {c.stats?.map((stat: any) => (
          <motion.div
            key={stat.label}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-3xl md:text-4xl font-bold text-gray-900">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </section>

      <section className="lg:w-3/4 mx-auto px-8 mt-28 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-serif text-gray-900">
            {c.mission?.title}
          </h2>
          <p className="mt-5 text-gray-500 leading-relaxed">
            {c.mission?.body}
          </p>
        </motion.div>

        <div className="space-y-10 border-l border-gray-200 pl-8">
          {c.timeline?.map((item: any) => (
            <motion.div
              key={item.year}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="relative"
            >
              <span
                className="absolute -left-[38px] top-1 h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: "var(--primary)" }}
              />
              <p
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "var(--primary)" }}
              >
                {item.year}
              </p>
              <h3 className="text-lg font-bold text-gray-900 mt-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="lg:w-3/4 mx-auto px-8 mt-28">
        <h2 className="text-3xl font-serif text-gray-900 text-center mb-14">
          What we stand for
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {c.values?.map((value: any) => {
            const Icon =
              iconMap[value.icon as keyof typeof iconMap] || Sparkles;
            return (
              <motion.div
                key={value.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: "var(--primary)",
                  }}
                >
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900">{value.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="lg:w-3/4 mx-auto px-8 mt-28">
        <h2 className="text-3xl font-serif text-gray-900 text-center mb-14">
          The people behind it
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {(c.team || defaultAboutPage.team)?.map(
            (member: { name: string; role: string; image: string }) => (
              <motion.div
                key={member.name}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="relative aspect-square rounded-3xl overflow-hidden mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {member.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
              </motion.div>
            ),
          )}
        </div>
      </section>

      <section className="lg:w-3/4 mx-auto px-8 mt-28">
        <div
          className="rounded-[40px] px-10 py-16 md:px-20 text-center text-white"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <h2 className="text-3xl md:text-4xl font-serif">{c.cta?.title}</h2>
          <p className="mt-4 text-white/80 max-w-md mx-auto">
            {c.cta?.description}
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 rounded-md px-8"
            >
              {c.cta?.primaryBtn}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 hover:bg-white/10 rounded-md px-8"
            >
              {c.cta?.secondaryBtn}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function About2() {
  const { primaryColor, aboutPage: c, dynamicStyles } = useAboutTheme();

  return (
    <div style={dynamicStyles} className="bg-[#f8f9fb] pt-32 pb-24">
      <section className="lg:w-3/4 mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <span
            className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full inline-block"
            style={{
              color: "var(--primary)",
              backgroundColor: `${primaryColor}15`,
            }}
          >
            {c.badge}
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-serif leading-tight text-gray-900">
            {c.heading}{" "}
            <span
              className="italic font-light"
              style={{ color: "var(--primary)" }}
            >
              {c.highlightText}
            </span>{" "}
            {c.headingSuffix}
          </h1>
          <p className="mt-6 text-gray-500 leading-relaxed">{c.intro}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-xl"
        >
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=900"
            alt="Our studio"
            fill
            className="object-cover"
          />
        </motion.div>
      </section>

      <section
        className="mt-20 py-14"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <div className="lg:w-3/4 mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {c.stats?.map((stat: any) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
              <p className="text-xs text-white/70 mt-1 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="lg:w-3/4 mx-auto px-8 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {c.values?.map((value: any) => {
            const Icon =
              iconMap[value.icon as keyof typeof iconMap] || Sparkles;
            return (
              <motion.div
                key={value.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white rounded-3xl p-8 flex items-start gap-5 shadow-sm"
              >
                <div
                  className="h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: "var(--primary)",
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{value.title}</h3>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="lg:w-3/4 mx-auto px-8 mt-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-2xl mx-auto text-center"
        >
          <Quote
            size={28}
            className="mx-auto mb-4"
            style={{ color: "var(--primary)" }}
          />
          <p className="text-2xl md:text-3xl font-serif text-gray-900 leading-snug">
            &quot;{c.quote?.text}&quot;
          </p>
          <p className="mt-4 text-sm text-gray-500">{c.quote?.author}</p>
        </motion.div>
      </section>

      <section className="lg:w-3/4 mx-auto px-8 mt-24">
        <h2 className="text-2xl font-serif text-gray-900 mb-10">
          Meet the team
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(c.team || defaultAboutPage.team)?.map(
            (member: { name: string; role: string; image: string }) => (
              <motion.div
                key={member.name}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white rounded-3xl p-4 text-center shadow-sm"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {member.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
              </motion.div>
            ),
          )}
        </div>
      </section>

      <section className="lg:w-3/4 mx-auto px-8 mt-24 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-200 pt-14">
        <div>
          <h2 className="text-2xl font-serif text-gray-900">{c.cta?.title}</h2>
          <p className="text-gray-500 mt-2 max-w-md">{c.cta?.description}</p>
        </div>
        <div className="flex gap-4 shrink-0">
          <Button size="lg" className="rounded-md px-8">
            {c.cta?.primaryBtn}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-md px-8 border-gray-300"
          >
            {c.cta?.secondaryBtn}
          </Button>
        </div>
      </section>
    </div>
  );
}

export function About3() {
  const { primaryColor, aboutPage: c, dynamicStyles } = useAboutTheme();

  return (
    <div style={dynamicStyles} className="bg-[#f8f9fb] pt-32 pb-24">
      <section className="max-w-2xl mx-auto px-8">
        <motion.span
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ color: "var(--primary)" }}
        >
          {c.badge}
        </motion.span>
        <motion.h1
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-4 text-4xl md:text-5xl font-serif leading-tight text-gray-900"
        >
          {c.heading}{" "}
          <span
            className="italic font-light"
            style={{ color: "var(--primary)" }}
          >
            {c.highlightText}
          </span>{" "}
          {c.headingSuffix}
        </motion.h1>
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-6 text-lg text-gray-600 leading-relaxed"
        >
          {c.intro}
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-10 border-l-2 pl-6 py-1"
          style={{ borderColor: "var(--primary)" }}
        >
          <p className="text-xl font-serif italic text-gray-900">
            &quot;{c.quote?.text}&quot;
          </p>
          <p className="mt-2 text-sm text-gray-500">{c.quote?.author}</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-12"
        >
          <h2 className="text-xl font-bold text-gray-900">
            {c.mission?.title}
          </h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            {c.mission?.body}
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-6 py-8 border-y border-gray-200">
          {c.stats?.map((stat: any) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-8">
          <h2 className="text-xl font-bold text-gray-900">What we stand for</h2>
          {c.values?.map((value: any, idx: number) => (
            <motion.div
              key={value.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex gap-5"
            >
              <span
                className="text-sm font-bold shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: "var(--primary)",
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-bold text-gray-900">{value.title}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 space-y-8">
          <h2 className="text-xl font-bold text-gray-900">Along the way</h2>
          {c.timeline?.map((item: any) => (
            <motion.div
              key={item.year}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex gap-5"
            >
              <span
                className="text-sm font-bold shrink-0 w-14"
                style={{ color: "var(--primary)" }}
              >
                {item.year}
              </span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            The people behind it
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {(c.team || defaultAboutPage.team)?.map((member: any) => (
              <motion.div
                key={member.name}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-2">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {member.name}
                </p>
                <p className="text-[11px] text-gray-500">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-14 rounded-3xl p-8 text-center"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <h2 className="text-xl font-bold text-gray-900">{c.cta?.title}</h2>
          <p className="text-sm text-gray-600 mt-2">{c.cta?.description}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button className="rounded-full px-6">{c.cta?.primaryBtn}</Button>
            <button
              type="button"
              className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: "var(--primary)" }}
            >
              {c.cta?.secondaryBtn} <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
