import Link from "next/link";
import {
  BookOpen,
  User,
  GraduationCap,
  BarChart3,
  Briefcase,
  GitCompare,
  Activity,
  Share2,
  MessageCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

/**
 * Documentation page (student-only).
 *
 * Halaman ini murni statis / konten penjelasan — tidak ada query ke
 * Supabase — jadi aman dibuka kapan pun walaupun profil/data belum
 * lengkap. Tujuannya: onboarding & "cara pakai" Horyzon buat siswa,
 * dijelasin selangkah demi selangkah sesuai flow inti:
 *
 *   Profile → Academic Data → Assessment → Classification →
 *   Gap Analysis → Recommendation → Action Plan → Progress
 */

type FlowStep = {
  step: number;
  title: string;
  description: string;
  href: string;
  cta: string;
};

const flowSteps: FlowStep[] = [
  {
    step: 1,
    title: "Lengkapi Profil Kamu",
    description:
      "Isi nama, fokus utama, dan data dasar di halaman Profile. Profil yang lengkap bikin hasil classification kamu lebih akurat dan Profile Completeness kamu naik.",
    href: "/dashboard/profile",
    cta: "Buka Profile",
  },
  {
    step: 2,
    title: "Isi Data Akademik, Skills & Pengalaman",
    description:
      "Masukkan nilai akademik (Matematika, Bahasa Inggris, IPA, dst), skill (programming, design, komunikasi, dll), project, kompetisi, organisasi, dan sertifikat kamu. Semakin lengkap, semakin banyak insight yang bisa Horyzon kasih.",
    href: "/dashboard/profile",
    cta: "Lengkapi di Profile",
  },
  {
    step: 3,
    title: "Jalankan Academic Assessment",
    description:
      "Dari data akademik, skills, dan interest kamu, Horyzon akan menentukan Academic Profile kamu — misalnya Technical-Oriented, Creative-Oriented, Analytical-Oriented, Communication-Oriented, atau Multidisciplinary — plus rekomendasi jalur pendidikan yang cocok.",
    href: "/dashboard/academic",
    cta: "Buka Academic",
  },
  {
    step: 4,
    title: "Pilih Target Karier",
    description:
      "Jelajahi Career Library, baca deskripsi dan competency requirement tiap karier (Software Engineer, Data Analyst, UI/UX Designer, dll), lalu tentukan karier target kamu.",
    href: "/dashboard/careers",
    cta: "Jelajahi Careers",
  },
  {
    step: 5,
    title: "Jalankan Career Readiness Assessment",
    description:
      "Horyzon membandingkan profil kamu dengan competency requirement karier target. Hasilnya berupa Readiness Score (0-100) dan classification: EXPLORING, DEVELOPING, READY WITH GAPS, atau CAREER READY — lengkap dengan penjelasan kenapa kamu dapat status itu.",
    href: "/dashboard/assessment",
    cta: "Buka Assessment",
  },
  {
    step: 6,
    title: "Lihat Competency Gap & Action Plan",
    description:
      "Cek competency mana yang sudah Exceeds/Meets requirement, dan mana yang masih Gap atau Major Gap. Horyzon kasih action plan yang diprioritaskan: current level, target level, dan langkah yang disarankan.",
    href: "/dashboard/assessment",
    cta: "Lihat Hasil Assessment",
  },
  {
    step: 7,
    title: "Bandingkan Beberapa Karier (Opsional)",
    description:
      "Bingung antara dua pilihan karier, misalnya Game Developer vs Full-Stack Developer? Pakai Compare Careers untuk lihat perbedaan competency requirement dan trade-off tiap jalur secara berdampingan.",
    href: "/dashboard/careers/compare",
    cta: "Buka Compare Careers",
  },
  {
    step: 8,
    title: "Minta Masukan dari Counselor atau AI",
    description:
      "Bagikan hasil assessment kamu ke counselor lewat share link untuk dapat feedback manusia, atau tanya langsung ke Ask AI kalau butuh penjelasan cepat soal hasil classification kamu.",
    href: "/dashboard/ask-counselor",
    cta: "Buka Ask Counselor",
  },
  {
    step: 9,
    title: "Update Progress & Reassessment",
    description:
      "Setelah mengerjakan action plan (misalnya menyelesaikan project atau sertifikat baru), update competency kamu dan jalankan ulang assessment. Buka Progress untuk lihat riwayat classification kamu dari waktu ke waktu.",
    href: "/dashboard/progress",
    cta: "Buka Progress",
  },
];

type FeatureDoc = {
  icon: LucideIcon;
  title: string;
  href: string;
  summary: string;
  points: string[];
};

const features: FeatureDoc[] = [
  {
    icon: User,
    title: "Profile",
    href: "/dashboard/profile",
    summary:
      "Pusat data kamu: academic record, skills, project, pengalaman, dan interest.",
    points: [
      "Isi nilai akademik per mata pelajaran",
      "Tambah skill beserta level & evidence (project/pengalaman pendukung)",
      "Catat project, kompetisi, organisasi, internship, dan sertifikat",
      "Pilih minat/interest (Software Development, Design, Data, dll)",
    ],
  },
  {
    icon: GraduationCap,
    title: "Academic",
    href: "/dashboard/academic",
    summary:
      "Analisis Academic Profile kamu dan rekomendasi jalur pendidikan yang cocok.",
    points: [
      "Lihat classification Academic Profile kamu beserta alasannya",
      "Cek jalur pendidikan (education path) dengan compatibility tertinggi",
      "Baca faktor apa saja yang bikin sebuah jalur cocok/tidak cocok buat kamu",
    ],
  },
  {
    icon: Briefcase,
    title: "Careers",
    href: "/dashboard/careers",
    summary: "Career Library — jelajahi semua karier yang tersedia di Horyzon.",
    points: [
      "Baca deskripsi tiap karier dan competency requirement-nya",
      "Jadikan salah satu karier sebagai target assessment kamu",
      "Lihat recommended learning area untuk tiap karier",
    ],
  },
  {
    icon: GitCompare,
    title: "Compare Careers",
    href: "/dashboard/careers/compare",
    summary: "Bandingkan 2 atau lebih karier berdampingan.",
    points: [
      "Lihat perbedaan competency requirement antar karier",
      "Pahami trade-off dan persiapan tiap jalur — bukan cuma angka",
      "Berguna kalau kamu masih ragu antara beberapa pilihan karier",
    ],
  },
  {
    icon: BarChart3,
    title: "Assessment",
    href: "/dashboard/assessment",
    summary: "Jalankan Career Readiness Assessment terhadap target karier kamu.",
    points: [
      "Dapatkan Readiness Score & classification (EXPLORING → CAREER READY)",
      "Lihat Competency Gap Analysis: Exceeds, Meets, Gap, Major Gap",
      "Dapatkan Action Plan yang diprioritaskan berdasarkan gap terbesar",
      "Kasih feedback setelah assessment (berguna / tidak, dan kenapa)",
    ],
  },
  {
    icon: Activity,
    title: "Progress",
    href: "/dashboard/progress",
    summary: "Riwayat classification & perkembangan readiness kamu dari waktu ke waktu.",
    points: [
      "Lihat perubahan readiness score setelah tiap reassessment",
      "Bandingkan classification lama vs baru",
      "Pantau apakah gap kamu makin mengecil setelah update competency",
    ],
  },
  {
    icon: Share2,
    title: "Share Assessment",
    href: "/dashboard/share",
    summary: "Bagikan hasil assessment kamu ke counselor/mentor lewat link.",
    points: [
      "Kamu yang kontrol assessment mana yang dibagikan",
      "Counselor bisa lihat hasil & kasih feedback lewat link tersebut",
      "Link bisa dicabut kapan saja kalau kamu tidak mau berbagi lagi",
    ],
  },
  {
    icon: MessageCircle,
    title: "Ask Counselor",
    href: "/dashboard/ask-counselor",
    summary: "Tanya langsung ke counselor/mentor soal hasil assessment kamu.",
    points: [
      "Ajukan pertanyaan seputar classification atau rencana pengembangan",
      "Cocok kalau kamu butuh pendapat manusia, bukan cuma sistem",
    ],
  },
  {
    icon: Sparkles,
    title: "Ask AI",
    href: "/dashboard/ask-ai",
    summary: "Tanya AI untuk penjelasan cepat seputar hasil & istilah di Horyzon.",
    points: [
      "Minta penjelasan kenapa kamu dapat classification tertentu",
      "Tanya rekomendasi langkah pengembangan yang lebih spesifik",
      "AI membantu menjelaskan, bukan menggantikan hasil classification kamu",
    ],
  },
];

const glossary: { term: string; description: string }[] = [
  {
    term: "Classification",
    description:
      "Kategori yang Horyzon berikan berdasarkan data kamu — misalnya Academic Profile (Technical-Oriented, dst) atau Career Readiness (EXPLORING, DEVELOPING, READY WITH GAPS, CAREER READY). Selalu disertai penjelasan dari data aktual kamu, bukan angka acak.",
  },
  {
    term: "Readiness Score",
    description:
      "Skor 0-100 yang meringkas seberapa siap kamu terhadap karier target, dihitung dari competency profile kamu dan bobot tiap competency di karier tersebut.",
  },
  {
    term: "Competency Gap",
    description:
      "Perbandingan level kompetensi kamu saat ini vs level yang dibutuhkan karier target. Statusnya bisa Exceeds, Meets, Gap, atau Major Gap.",
  },
  {
    term: "Profile Completeness",
    description:
      "Indikator seberapa lengkap data kamu (Academic Data, Skills, Projects, Experience, Interests, Career Target, Certifications). Makin lengkap, makin akurat & banyak insight yang bisa didapat.",
  },
  {
    term: "Confidence / Limited Data",
    description:
      "Peringatan yang muncul kalau data kamu masih terbatas. Ini bukan prediksi peluang sukses karier — cuma penanda bahwa hasil classification-nya masih berdasarkan data yang belum lengkap.",
  },
  {
    term: "Action Plan",
    description:
      "Daftar langkah yang disarankan Horyzon setelah gap analysis, diurutkan berdasarkan prioritas — mencantumkan level kamu sekarang, level target, dan saran tindakan.",
  },
];

export default function DocumentationPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start gap-3">
        <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
          <BookOpen className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Documentation
          </h2>
          <p className="text-muted-foreground mt-1">
            Panduan buat kamu (student) memahami alur dan fitur Horyzon —
            dari mengisi profil sampai dapat rekomendasi karier.
          </p>
        </div>
      </div>

      <Card className="bg-muted/40">
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            <strong className="text-foreground">Horyzon</strong> menganalisis
            data akademik, skill, pengalaman, dan minat kamu untuk membantu
            memahami posisi kamu terhadap jalur pendidikan atau karier
            pilihan — bukan menentukan masa depan kamu, tapi membantu kamu
            mengambil keputusan yang lebih terarah.
          </span>
        </CardContent>
      </Card>

      <Tabs defaultValue="flow" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flow">Alur Belajar</TabsTrigger>
          <TabsTrigger value="features">Semua Fitur</TabsTrigger>
          <TabsTrigger value="glossary">Istilah Penting</TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: STEP-BY-STEP FLOW ================= */}
        <TabsContent value="flow" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Ikuti urutan ini dari atas ke bawah kalau kamu baru pertama kali
            pakai Horyzon. Tiap langkah ada tombol pintasan ke halamannya.
          </p>

          <div className="space-y-3">
            {flowSteps.map((item) => (
              <Card key={item.step}>
                <CardContent className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
                    {item.step}
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 self-start sm:self-center"
                    render={<Link href={item.href} />}
                    nativeButton={false}
                  >
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ================= TAB 2: FEATURE REFERENCE ================= */}
        <TabsContent value="features" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Penjelasan tiap halaman/fitur yang bisa kamu akses lewat menu di
            samping (atau menu hamburger di HP).
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.href}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                    <CardDescription>{feature.summary}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <ul className="space-y-1.5">
                      {feature.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-foreground/50" />
                          {point}
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-0"
                      render={<Link href={feature.href} />}
                      nativeButton={false}
                    >
                      Buka {feature.title}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ================= TAB 3: GLOSSARY ================= */}
        <TabsContent value="glossary" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Istilah yang sering muncul di hasil assessment kamu.
          </p>

          <Card>
            <CardContent className="divide-y divide-border">
              {glossary.map((item, idx) => (
                <div
                  key={item.term}
                  className={
                    idx === 0
                      ? "pb-4 space-y-1.5"
                      : "py-4 space-y-1.5 first:pt-0 last:pb-0"
                  }
                >
                  <Badge variant="outline">{item.term}</Badge>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Separator />

          <p className="text-xs text-muted-foreground">
            Masih bingung soal hasil assessment kamu? Coba{" "}
            <Link href="/dashboard/ask-ai" className="underline underline-offset-2">
              tanya Ask AI
            </Link>{" "}
            atau{" "}
            <Link
              href="/dashboard/ask-counselor"
              className="underline underline-offset-2"
            >
              hubungi counselor kamu
            </Link>
            .
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
