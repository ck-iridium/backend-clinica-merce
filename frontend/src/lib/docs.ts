import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface DocParsedContent {
  id: string;
  title: string;
  content: string;
}

export function getDocContent(lang: string, slug: string): DocParsedContent {
  const defaultLang = 'es';
  let targetLang = lang;

  // Clean the language key
  if (!['es', 'en', 'fr'].includes(targetLang)) {
    targetLang = defaultLang;
  }

  let filePath = path.join(process.cwd(), 'content', 'docs', targetLang, `${slug}.md`);

  // Check if file exists, fallback to default Spanish
  if (!fs.existsSync(filePath)) {
    filePath = path.join(process.cwd(), 'content', 'docs', defaultLang, `${slug}.md`);
  }

  // If still missing, return a safe fallback object
  if (!fs.existsSync(filePath)) {
    return {
      id: slug,
      title: slug,
      content: 'Documentation not found.'
    };
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  return {
    id: data.id || slug,
    title: data.title || slug,
    content: content
  };
}
