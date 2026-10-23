import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { NavigationView } from "./navigation";

test("renders native mobile disclosure with every conventional route", () => {
  const html = renderToStaticMarkup(<NavigationView pathname="/" />);

  expect(html).toContain("<details");
  expect(html).toContain("<summary");
  expect(html).toContain('href="/"');
  expect(html).toContain('href="/blog"');
  expect(html).toContain('href="/about"');
  expect(html).toContain('href="/links"');
});

test("marks blog descendants active without matching sibling prefixes", () => {
  const blogPostHtml = renderToStaticMarkup(
    <NavigationView pathname="/blog/example" />,
  );
  const siblingHtml = renderToStaticMarkup(
    <NavigationView pathname="/blogger" />,
  );

  expect(blogPostHtml).toContain('aria-current="page"');
  expect(siblingHtml).not.toContain('aria-current="page"');
});
