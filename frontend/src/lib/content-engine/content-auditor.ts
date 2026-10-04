import { EcosystemData } from '../seo-engine/types';
import { ContentAuditNode, ContentAuditReport, ContentStatus } from './types';

export function auditTenantContent(ecosystem: EcosystemData): ContentAuditReport {
  const nodes: ContentAuditNode[] = [];

  let totalScore = 0;
  let emptyCount = 0;
  let thinCount = 0;
  let optimalCount = 0;
  let withoutRichContentCount = 0;
  let totalDescLength = 0;
  let withFullContentCount = 0;

  // 1. Auditar categorías
  for (const cat of ecosystem.categories) {
    const rawDesc = cat.description?.trim() || '';
    const descLen = rawDesc.length;
    totalDescLength += descLen;

    const issues: string[] = [];
    let status: ContentStatus = 'optimal';
    let score = 100;

    if (!rawDesc) {
      status = 'empty';
      score = 0;
      issues.push('Sin descripción editorial de categoría');
      emptyCount++;
    } else if (descLen < 60) {
      status = 'thin';
      score = 45;
      issues.push('Descripción breve (< 60 caracteres)');
      thinCount++;
    } else {
      status = 'optimal';
      score = 100;
      optimalCount++;
    }

    totalScore += score;

    nodes.push({
      id: `category-${cat.id}`,
      type: 'category',
      name: cat.name,
      slug: cat.slug,
      categoryName: null,
      price: null,
      duration: null,
      description: rawDesc || null,
      contentHtml: null,
      descriptionLength: descLen,
      contentHtmlLength: 0,
      status,
      score,
      issues,
      translations: cat.translations,
    });
  }

  // 2. Auditar servicios
  for (const svc of ecosystem.services) {
    const rawDesc = svc.description?.trim() || '';
    const rawHtml = svc.content_html?.trim() || '';
    const descLen = rawDesc.length;
    const htmlLen = rawHtml.length;
    totalDescLength += descLen;

    const issues: string[] = [];
    let status: ContentStatus = 'optimal';
    let score = 100;

    const hasDesc = descLen > 0;
    const hasHtml = htmlLen > 0;

    if (!hasHtml) {
      withoutRichContentCount++;
    }

    if (!hasDesc && !hasHtml) {
      status = 'empty';
      score = 0;
      issues.push('Sin extracto corto');
      issues.push('Sin contenido detallado estructurado');
      emptyCount++;
    } else if (!hasDesc && hasHtml) {
      status = 'thin';
      score = 50;
      issues.push('Sin extracto corto para tarjetas y catálogo');
      thinCount++;
    } else if (descLen < 80) {
      if (!hasHtml) {
        status = 'thin';
        score = 30;
        issues.push('Extracto muy breve (< 80 caracteres)');
        issues.push('Sin contenido detallado estructurado');
        thinCount++;
      } else {
        status = 'thin';
        score = 70;
        issues.push('Extracto breve (< 80 caracteres)');
        thinCount++;
      }
    } else {
      // Tiene descripción decente (>= 80 caracteres)
      if (!hasHtml) {
        status = 'thin';
        score = 55;
        issues.push('Sin contenido comercial detallado en HTML');
        thinCount++;
      } else if (htmlLen < 150) {
        status = 'thin';
        score = 75;
        issues.push('Contenido detallado insuficiente (< 150 caracteres)');
        thinCount++;
      } else {
        status = 'optimal';
        score = 100;
        optimalCount++;
        withFullContentCount++;
      }
    }

    totalScore += score;

    nodes.push({
      id: `service-${svc.id}`,
      type: 'service',
      name: svc.name,
      slug: svc.slug,
      categoryName: svc.category_name,
      price: svc.price,
      duration: svc.duration_minutes,
      description: rawDesc || null,
      contentHtml: rawHtml || null,
      descriptionLength: descLen,
      contentHtmlLength: htmlLen,
      status,
      score,
      issues,
      translations: svc.translations,
    });
  }

  const totalEntities = nodes.length;
  const overallScore = totalEntities > 0 ? Math.round(totalScore / totalEntities) : 100;
  const avgDescLen = totalEntities > 0 ? Math.round(totalDescLength / totalEntities) : 0;

  return {
    overallScore,
    totalEntities,
    emptyCount,
    thinCount,
    optimalCount,
    withoutRichContentCount,
    summary: {
      servicesCount: ecosystem.services.length,
      categoriesCount: ecosystem.categories.length,
      averageDescriptionLength: avgDescLen,
      withFullContentCount,
    },
    nodes,
    analyzedAt: new Date().toISOString(),
  };
}
