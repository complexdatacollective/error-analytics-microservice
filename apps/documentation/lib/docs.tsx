import { existsSync, readFileSync } from 'fs';
import { join, sep } from 'path';
import type { Options } from 'rehype-react';
import * as prod from 'react/jsx-runtime';
import rehypeReact from 'rehype-react';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import { unified } from 'unified';
import { z } from 'zod';
import {
  Button,
  Heading,
  ListItem,
  OrderedList,
  Paragraph,
  UnorderedList,
} from '@acme/ui';

import {
  locales,
  type LocalesEnum,
  type SidebarFolder,
  type SidebarPage,
  type SidebarProject,
  type TSideBar,
} from '~/app/types';
import Link from '~/components/Link';
import sidebar from '~/public/sidebar.json';
import { get } from './helper_functions';
import processYamlMatter from './processYamlMatter';
import slug from 'rehype-slug';
import { type HeadingNode, headingTree } from './tableOfContents';
import StandAloneImage from '~/app/[locale]/[project]/_components/customComponents/StandAloneImage';
import TipBox from '~/app/[locale]/[project]/_components/customComponents/TipBox';

export type DocRouteParams = {
  params: {
    docPath: string;
  };
};

export const FrontmatterSchema = z.object({
  title: z.string(),
  lastUpdated: z.string().optional(),
  hidden: z.boolean().optional(),
  wip: z.boolean().optional(),
  nav_order: z.number().optional(),
  toc: z.boolean().optional(),
  // Tutorials
  summary: z.string().optional(), // Summary of the tutorial
  prerequisites: z.string().optional(), // Prerequisites for the tutorial
  completion_time: z.string().optional(), // Estimated time to complete the tutorial
  // interfaces
  image: z.string().optional(), // Path to hero image
  type: z.string().optional(), // Name of interface
  creates: z.string().optional(), // What the interface creates
  uses_prompts: z.string().optional(), // If the interface supports prompts
  good: z.array(z.string()).optional(), // List of best practices
  bad: z.array(z.string()).optional(), // List of bad practices
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;

// get available locales for the document path
export function getAvailableLocalesForPath(
  project: string,
  pathSegment: string[],
) {
  // iterate through all locales and check if the file exists
  const availableLocales = locales.filter((locale) => {
    const sourceFile = getSourceFile(locale, project, pathSegment);
    const isFileExist = !!(sourceFile && existsSync(sourceFile));
    return isFileExist;
  });

  return availableLocales;
}

// Process docPaths to remove CWD, docs subdirectory, file extensions, and split into segments
export const processPath = (docPath: string) => {
  const processedPath = docPath
    .split(sep)
    .slice(3) // First element is empty string, second is 'docs', third is the project name
    // Process the last item to remove the locale and file extension
    .map((segment, index, array) => {
      if (index === array.length - 1) {
        return segment.split('.')[0]!;
      }
      return segment;
    });

  return processedPath;
};

// Given locale and project, generate all the possible docPaths.
// Return something in the format of:
// {
//   locale: 'ru',
//   project: 'fresco',
//   docPath: [ 'getting-started', 'installation' ]
// }
type ReturnType = {
  locale: LocalesEnum;
  project: string;
  docPath: string[];
};

export const getDocsForRouteSegment = ({
  locale,
  project,
}: {
  locale: LocalesEnum;
  project: string;
}) => {
  const typedSidebar = sidebar as TSideBar;
  const sidebarData = get(
    typedSidebar,
    [locale, project],
    null,
  ) as SidebarProject;

  if (!sidebarData) {
    // eslint-disable-next-line no-console
    console.log(`No sidebar data found for ${locale} and ${project}`);
    return [];
  }

  const results: ReturnType[] = [];

  const getSourceFilePaths = (
    data: SidebarProject | SidebarFolder | SidebarPage,
  ) => {
    // Leaf node
    if (data.type === 'page') {
      results.push({
        locale,
        project,
        docPath: processPath(data.sourceFile),
      });
      return;
    }

    if (data.sourceFile) {
      // Handle projects and folders differently - if they have a souceFile
      // docPath should generate a path pointing to the folder/project.
      results.push({
        locale,
        project,
        docPath: processPath(data.sourceFile).slice(0, -1),
      });
    }

    for (const key in data.children) {
      const child = data.children[key];
      if (child) {
        getSourceFilePaths(child);
      }
    }

    return;
  };

  getSourceFilePaths(sidebarData);

  return results;
};

// Get the sourceFile path from the sidebar.json
export const getSourceFile = (
  locale: string,
  project: string,
  pathSegment?: string[],
) => {
  const projectSourceFile = get(
    sidebar,
    [locale, project, 'sourceFile'],
    null,
  ) as string;

  if (!pathSegment) return join(process.cwd(), projectSourceFile);

  const pathSegmentWithChildren = pathSegment
    .map((segment, index) => {
      if (index === 0) {
        return segment;
      }

      return ['children', segment];
    })
    .flat();

  const folderSourceFile = get(
    sidebar,
    [locale, project, 'children', ...pathSegmentWithChildren, 'sourceFile'],
    null,
  ) as string | null;

  if (!folderSourceFile) return null;

  return join(process.cwd(), folderSourceFile);
};

export async function getDocumentForPath({
  locale,
  project,
  pathSegment,
}: {
  locale: string;
  project: string;
  pathSegment?: string[];
}) {
  const sourceFile = getSourceFile(locale, project, pathSegment);

  if (!sourceFile || (sourceFile && !existsSync(sourceFile))) {
    // eslint-disable-next-line no-console
    console.log(`File not found: ${sourceFile}`);
    return null;
  }

  const markdownFile = readFileSync(sourceFile, 'utf-8');

  const result = await unified()
    .use(remarkParse, { fragment: true })
    .use(remarkFrontmatter)
    .use(processYamlMatter)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw, {
      passThrough: ['link'],
    }) // Allow raw HTML
    .use(slug) // Add IDs to headings
    .use(headingTree) // Create a tree of headings in data.headings
    .use(rehypeReact, {
      Fragment: prod.Fragment,
      jsx: prod.jsx,
      jsxs: prod.jsxs,
      passNode: true,
      components: {
        // @ts-expect-error: Seems to be an issue with React types.
        h1: (props) => <Heading variant="h1" {...props} />,
        // @ts-expect-error: Seems to be an issue with React types.
        h2: (props) => <Heading variant="h2" {...props} />,
        // @ts-expect-error: Seems to be an issue with React types.
        h3: (props) => <Heading variant="h3" {...props} />,
        // @ts-expect-error: Seems to be an issue with React types.
        h4: (props) => <Heading variant="h4" {...props} />,
        p: Paragraph,
        a: Link,
        ul: UnorderedList,
        ol: OrderedList,
        li: ListItem,
        blockquote: (props) => (
          <blockquote className="my-4 border-s-4 border-accent bg-card p-4">
            {props.children}
          </blockquote>
        ),
        pre: (props) => (
          <pre className="overflow-x-auto bg-card p-4">{props.children}</pre>
        ),
        code: (props) => (
          <code className="p-1 font-mono text-sm">{props.children}</code>
        ),
        button: (props) => (
          // @ts-expect-error: Seems to be an issue with React types.
          <Button variant="default" className="mt-4" {...props} />
        ),
        link: (props) => {
          console.log('link props', props);
          return <Link {...props} />;
        },
        standaloneimage: StandAloneImage,
        tipbox: TipBox,
      },
    } as Options)
    .process(markdownFile);

  const validatedFrontmatter = FrontmatterSchema.parse(result.data.matter);

  return {
    frontmatter: validatedFrontmatter,
    headings: result.data.headings as HeadingNode[],
    component: result.result,
  };
}