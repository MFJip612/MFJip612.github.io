import type { Metadata } from "next";

import { LinkGroup } from "@/components/link-group";
import { PageHeading } from "@/components/page-heading";
import { listLinks } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Links",
  description: "People, projects, tools, and writing worth visiting.",
};

export default async function LinksPage() {
  const links = await listLinks();
  const linksByCategory = links.reduce((groups, link) => {
    groups.set(link.category, [...(groups.get(link.category) ?? []), link]);
    return groups;
  }, new Map<string, typeof links>());

  return (
    <div>
      <PageHeading
        path="~/links"
        title="Links"
        description="A small, maintained directory of tools and writing that make the web more useful."
      />

      <div className="mt-14 space-y-12">
        {links.length === 0 ? (
          <p className="border-y border-line py-8 font-mono text-sm text-muted">
            <span className="text-amber" aria-hidden="true">
              warning:
            </span>{" "}
            No links configured.
          </p>
        ) : (
          Array.from(linksByCategory, ([category, categoryLinks]) => (
            <LinkGroup
              key={category}
              category={category}
              links={categoryLinks}
            />
          ))
        )}
      </div>
    </div>
  );
}
