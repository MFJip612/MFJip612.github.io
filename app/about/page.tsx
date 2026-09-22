import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { getProfile } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "About",
  description: "About MFJip612, the work, and the ideas behind this site.",
};

export default async function AboutPage() {
  const profile = await getProfile();

  return (
    <div>
      <PageHeading
        path="~/about"
        title="About"
        description={profile.headline}
      />

      <div className="mt-14 grid gap-12 border-t border-line pt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.65fr)] lg:gap-20">
        <section aria-labelledby="about-story">
          <h2 id="about-story" className="font-mono text-sm text-accent">
            ./story
          </h2>
          <div className="mt-5 max-w-3xl space-y-5 text-base leading-8 text-foreground/85 sm:text-lg sm:leading-9">
            {profile.biography.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <dl className="border-y border-line font-mono text-sm">
          <div className="grid grid-cols-[6rem_1fr] gap-4 border-b border-line py-4">
            <dt className="text-muted">location</dt>
            <dd className="text-foreground">{profile.location}</dd>
          </div>
          <div className="grid grid-cols-[6rem_1fr] gap-4 border-b border-line py-4">
            <dt className="text-muted">email</dt>
            <dd className="min-w-0">
              <a
                href={`mailto:${profile.email}`}
                className="break-all text-accent underline decoration-accent-dim underline-offset-4"
              >
                {profile.email}
              </a>
            </dd>
          </div>
          {profile.socialLinks.map((link) => (
            <div
              key={link.url}
              className="grid grid-cols-[6rem_1fr] gap-4 border-b border-line py-4 last:border-b-0"
            >
              <dt className="text-muted">social</dt>
              <dd>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground transition-colors hover:text-accent"
                >
                  {link.label} ↗
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
        <section aria-labelledby="principles-heading">
          <h2
            id="principles-heading"
            className="font-mono text-xl font-semibold text-foreground"
          >
            <span className="text-accent" aria-hidden="true">
              &gt;{" "}
            </span>
            Working principles
          </h2>
          <ol className="mt-6 border-y border-line">
            {profile.principles.map((principle, index) => (
              <li
                key={principle}
                className="grid grid-cols-[2rem_1fr] gap-4 border-t border-line py-5 first:border-t-0"
              >
                <span
                  className="font-mono text-xs text-muted"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="leading-7 text-foreground/85">
                  {principle}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="interests-heading">
          <h2
            id="interests-heading"
            className="font-mono text-xl font-semibold text-foreground"
          >
            <span className="text-accent" aria-hidden="true">
              &gt;{" "}
            </span>
            Current interests
          </h2>
          <ul className="mt-6 border-y border-line">
            {profile.interests.map((interest) => (
              <li
                key={interest}
                className="border-t border-line py-5 font-mono text-sm text-muted first:border-t-0"
              >
                <span className="mr-3 text-amber" aria-hidden="true">
                  +
                </span>
                {interest}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
