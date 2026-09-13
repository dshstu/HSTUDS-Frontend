import { collection, doc, getDoc, getDocs, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface BlogPost {
  id: string;
  slug?: string;
  title: string;
  coverImageUrl?: string;
  imageUrl?: string;
  contentMarkdown?: string;
  bodyRichText?: string;
  content?: string;
  description?: string;
  excerpt?: string;
  summary?: string;
  readTimeMinutes?: number;
  tags?: string[];
  category?: string;
  author?: string;
  authorName?: string;
  authorImageUrl?: string;
  authorAvatar?: string;
  authorRole?: string;
  createdAt?: any;
  publishedAt?: any;
  status?: string;
  featured?: boolean;
  order?: number;
  [key: string]: any;
}

export interface Partner {
  id: string;
  name: string;
  category?: string;
  description?: string;
  displayInFrontend?: boolean;
  image?: string;
  imageUrl?: string;
  logo?: string;
  logoUrl?: string;
  order?: number;
  position?: number;
  status?: string;
  websiteUrl?: string;
  createdAt?: any;
  [key: string]: any;
}

// Helper to extract clean text from rich object or HTML/Markdown
export function extractTextContent(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  
  if (typeof val === 'object') {
    // If it's a Tiptap / ProseMirror Document node
    if (val.type === 'doc' && Array.isArray(val.content)) {
      return renderTiptapNodes(val.content).trim();
    }
    
    // If it's an array of nodes
    if (Array.isArray(val)) {
      return val.map((item) => extractTextContent(item)).filter(Boolean).join('\n\n');
    }

    // Single node object
    if (val.content) {
      return extractTextContent(val.content);
    }
    if (val.text) {
      return String(val.text);
    }
    if (val.value) {
      return extractTextContent(val.value);
    }
    if (val.html) {
      return String(val.html);
    }
    if (val.markdown) {
      return String(val.markdown);
    }

    try {
      return JSON.stringify(val);
    } catch {
      return '';
    }
  }
  return String(val);
}

function renderTiptapNodes(nodes: any[]): string {
  if (!Array.isArray(nodes)) return '';
  return nodes
    .map((node) => {
      if (!node) return '';
      if (typeof node === 'string') return node;

      const nodeType = node.type || '';
      const contentNodes = Array.isArray(node.content) ? node.content : [];

      // Extract inline text with basic formatting
      const textFromContent = contentNodes
        .map((child: any) => {
          if (!child) return '';
          if (child.type === 'text') {
            let t = child.text || '';
            if (Array.isArray(child.marks)) {
              child.marks.forEach((mark: any) => {
                if (mark.type === 'bold' || mark.type === 'strong') t = `**${t}**`;
                if (mark.type === 'italic' || mark.type === 'em') t = `*${t}*`;
                if (mark.type === 'code') t = `\`${t}\``;
                if (mark.type === 'link' && mark.attrs?.href) t = `[${t}](${mark.attrs.href})`;
              });
            }
            return t;
          }
          if (child.type === 'hardBreak') return '\n';
          return extractTextContent(child);
        })
        .join('');

      switch (nodeType) {
        case 'heading': {
          const level = node.attrs?.level || 2;
          const hashes = '#'.repeat(level);
          return `${hashes} ${textFromContent}`;
        }
        case 'paragraph':
          return textFromContent;
        case 'bulletList':
          return contentNodes
            .map((li: any) => `- ${renderTiptapNodes(li.content || []).trim()}`)
            .join('\n');
        case 'orderedList':
          return contentNodes
            .map((li: any, i: number) => `${i + 1}. ${renderTiptapNodes(li.content || []).trim()}`)
            .join('\n');
        case 'listItem':
          return textFromContent || renderTiptapNodes(contentNodes);
        case 'blockquote':
          return textFromContent
            .split('\n')
            .map((line: string) => `> ${line}`)
            .join('\n');
        case 'codeBlock': {
          const lang = node.attrs?.language || '';
          return `\`\`\`${lang}\n${textFromContent}\n\`\`\``;
        }
        case 'horizontalRule':
          return '---';
        case 'image':
          return `![${node.attrs?.alt || 'image'}](${node.attrs?.src || ''})`;
        default:
          return textFromContent || (node.text ? String(node.text) : '');
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

export function parseFirebaseDate(dateField: any): string | null {
  if (!dateField) return null;
  if (typeof dateField === 'string') return dateField;
  if (dateField instanceof Date) return dateField.toISOString();
  if (typeof dateField.toDate === 'function') {
    try {
      return dateField.toDate().toISOString();
    } catch {
      // ignore
    }
  }
  if (typeof dateField.seconds === 'number') {
    return new Date(dateField.seconds * 1000).toISOString();
  }
  if (typeof dateField === 'number') {
    return new Date(dateField).toISOString();
  }
  return null;
}

export function normalizeBlog(docId: string, raw: any): BlogPost {
  const data = raw || {};
  const rawContent = data.bodyRichText || data.contentMarkdown || data.content || data.body || data.description || data.articleBody || data.html || data.text || '';
  const contentText = extractTextContent(rawContent);
  
  const dateVal = parseFirebaseDate(data.publishedAt) 
    || parseFirebaseDate(data.createdAt) 
    || parseFirebaseDate(data.date) 
    || parseFirebaseDate(data.updatedAt) 
    || parseFirebaseDate(data.timestamp);

  const cover = data.coverImageUrl 
    || data.coverImage 
    || data.imageUrl 
    || data.image 
    || data.thumbnail 
    || data.bannerUrl 
    || data.featuredImage 
    || '';

  // Extract clean plain text for excerpt
  let plainExcerpt = data.excerpt || data.summary || data.shortDescription || '';
  if (!plainExcerpt && contentText) {
    plainExcerpt = contentText
      .replace(/<[^>]+>/g, ' ')
      .replace(/[*#`_~\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 180);
    if (contentText.length > 180) plainExcerpt += '...';
  }

  // Tags extraction
  let tagList: string[] = [];
  if (Array.isArray(data.tags)) {
    tagList = data.tags.filter(Boolean).map((t: any) => String(t).trim());
  } else if (typeof data.tags === 'string') {
    tagList = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  } else if (Array.isArray(data.categories)) {
    tagList = data.categories.filter(Boolean).map((c: any) => String(c).trim());
  } else if (typeof data.category === 'string' && data.category.trim()) {
    tagList = [data.category.trim()];
  }

  // Calculate read time if not provided
  const wordCount = contentText ? contentText.split(/\s+/).length : 0;
  const estimatedReadTime = data.readTimeMinutes || data.readTime || data.readingTime || Math.max(1, Math.ceil(wordCount / 200));

  const authorName = data.authorName || data.author || data.writer || data.createdBy || 'CE Club HSTU';
  const authorAvatar = data.authorImageUrl || data.authorAvatar || data.authorImage || data.avatar || data.authorPhoto || '';
  const authorRole = data.authorRole || data.role || data.designation || data.authorDesignation || '';

  return {
    id: docId,
    ...data,
    slug: data.slug || docId,
    title: data.title || data.heading || data.name || 'Untitled Article',
    coverImageUrl: cover,
    imageUrl: cover,
    contentMarkdown: contentText,
    bodyRichText: contentText,
    content: contentText,
    description: contentText,
    excerpt: plainExcerpt,
    summary: plainExcerpt,
    readTimeMinutes: estimatedReadTime,
    tags: tagList,
    category: data.category || (tagList[0] || 'General'),
    author: authorName,
    authorName: authorName,
    authorImageUrl: authorAvatar,
    authorAvatar: authorAvatar,
    authorRole: authorRole,
    createdAt: dateVal,
    publishedAt: dateVal,
    status: data.status || 'published',
    featured: Boolean(data.featured),
    order: typeof data.order === 'number' ? data.order : 0,
  };
}

export const BLOG_COLLECTIONS = ['blog', 'blogs', 'posts', 'articles', 'content_blog', 'blog_posts', 'site_blogs'];

export async function getAllBlogs(): Promise<BlogPost[]> {
  if (!db) return [];
  const allPostsMap = new Map<string, BlogPost>();

  for (const colName of BLOG_COLLECTIONS) {
    try {
      const snap = await getDocs(collection(db, colName));

      if (snap && !snap.empty) {
        snap.docs.forEach((d) => {
          const raw = d.data();
          const normalized = normalizeBlog(d.id, raw);
          
          // Show published posts or posts without explicit draft/archived status
          const isDraft = normalized.status === 'draft' || normalized.status === 'archived' || raw.isPublished === false;
          if (!isDraft) {
            allPostsMap.set(d.id, normalized);
          }
        });
      }
    } catch (e) {
      console.warn(`Querying collection ${colName} failed:`, e);
    }
  }

  const posts = Array.from(allPostsMap.values());
  // Sort descending by date, with order as tie-breaker
  posts.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.publishedAt ? new Date(a.publishedAt).getTime() : 0);
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.publishedAt ? new Date(b.publishedAt).getTime() : 0);
    if (timeB !== timeA) return timeB - timeA;
    return (a.order || 0) - (b.order || 0);
  });

  return posts;
}

export async function getLatestBlogs(count = 3): Promise<BlogPost[]> {
  const all = await getAllBlogs();
  return all.slice(0, count);
}

export async function getBlogById(idOrSlug: string): Promise<BlogPost | null> {
  if (!db || !idOrSlug) return null;
  const cleanKey = decodeURIComponent(idOrSlug).trim();

  for (const colName of BLOG_COLLECTIONS) {
    try {
      // 1. Direct document lookup by doc ID
      try {
        const docRef = doc(db, colName, cleanKey);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return normalizeBlog(docSnap.id, docSnap.data());
        }
      } catch {
        // Continue to query search
      }

      // 2. Query by slug
      const bySlugQuery = query(collection(db, colName), where('slug', '==', cleanKey));
      const slugSnap = await getDocs(bySlugQuery);
      if (!slugSnap.empty) {
        const d = slugSnap.docs[0];
        return normalizeBlog(d.id, d.data());
      }

      // 3. Query by id field
      const byIdQuery = query(collection(db, colName), where('id', '==', cleanKey));
      const idSnap = await getDocs(byIdQuery);
      if (!idSnap.empty) {
        const d = idSnap.docs[0];
        return normalizeBlog(d.id, d.data());
      }
    } catch (e) {
      console.warn(`Error finding blog in ${colName}:`, e);
    }
  }

  // Fallback: search all in memory in case of slug/id variations
  const all = await getAllBlogs();
  const found = all.find((p) => 
    p.id === cleanKey || 
    p.slug === cleanKey || 
    p.slug?.toLowerCase() === cleanKey.toLowerCase() ||
    p.id.toLowerCase() === cleanKey.toLowerCase()
  );
  return found || null;
}

export interface EventItem {
  id: string;
  title: string;
  descriptionMarkdown: string;
  description?: string;
  contentMarkdown?: string;
  bodyRichText?: string;
  location: string;
  coverImageUrl: string;
  imageUrl?: string;
  eventDate: string;
  time?: string;
  googleFormUrl?: string;
  registrationUrl?: string;
  facebookUrl?: string;
  status?: string;
  [key: string]: any;
}

export function normalizeEvent(docId: string, raw: any): EventItem {
  const data = raw || {};
  const desc = data.descriptionMarkdown || data.description || data.contentMarkdown || data.bodyRichText || data.content || '';
  const cover = data.coverImageUrl || data.imageUrl || data.image || data.coverImage || data.thumbnail || 'https://picsum.photos/seed/event_' + docId + '/800/450';
  const rawDate = data.eventDate || data.date || data.startDate || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : '');

  return {
    id: docId,
    ...data,
    title: data.title || 'Untitled Event',
    descriptionMarkdown: desc,
    description: desc,
    location: data.location || data.venue || 'HSTU Campus / TBA',
    coverImageUrl: cover,
    imageUrl: cover,
    eventDate: rawDate || new Date().toISOString().split('T')[0],
    time: data.time || data.eventTime || data.startTime || 'TBA',
    googleFormUrl: data.googleFormUrl || data.registrationUrl || data.formUrl || data.ticketUrl || '',
    facebookUrl: data.facebookUrl || data.galleryUrl || data.link || '',
    status: data.status || 'published',
  };
}

export async function getUpcomingEvents(count = 20): Promise<EventItem[]> {
  if (!db) return [];
  const today = new Date().toISOString().split('T')[0];
  const collectionsToTry = ['event_logs', 'events', 'upcoming_events'];
  const eventMap = new Map<string, EventItem>();

  for (const colName of collectionsToTry) {
    try {
      const snap = await getDocs(collection(db, colName));
      if (snap && !snap.empty) {
        snap.docs.forEach((doc) => {
          const item = normalizeEvent(doc.id, doc.data());
          if (item.status !== 'draft' && item.status !== 'archived') {
            if (item.eventDate >= today || !item.eventDate) {
              eventMap.set(doc.id, item);
            }
          }
        });
      }
    } catch (e) {
      console.warn(`Querying upcoming events from ${colName} failed:`, e);
    }
  }

  const events = Array.from(eventMap.values());
  // Sort ascending by event date (soonest first)
  events.sort((a, b) => {
    return (a.eventDate || '').localeCompare(b.eventDate || '');
  });

  return events.slice(0, count);
}

export async function getArchivedEvents(count = 50): Promise<EventItem[]> {
  if (!db) return [];
  const today = new Date().toISOString().split('T')[0];
  const collectionsToTry = ['event_logs', 'events', 'events_archive', 'archived_events'];
  const eventMap = new Map<string, EventItem>();

  for (const colName of collectionsToTry) {
    try {
      const snap = await getDocs(collection(db, colName));
      if (snap && !snap.empty) {
        snap.docs.forEach((doc) => {
          const item = normalizeEvent(doc.id, doc.data());
          if (item.status !== 'draft') {
            // If date is before today, or marked as completed/archived
            if ((item.eventDate && item.eventDate < today) || item.status === 'archived' || item.status === 'past') {
              eventMap.set(doc.id, item);
            }
          }
        });
      }
    } catch (e) {
      console.warn(`Querying archived events from ${colName} failed:`, e);
    }
  }

  const events = Array.from(eventMap.values());
  // Sort descending by event date (most recent past event first)
  events.sort((a, b) => {
    return (b.eventDate || '').localeCompare(a.eventDate || '');
  });

  return events.slice(0, count);
}

export async function getAllLeadershipMembers(category?: string) {
  if (!db) return [];
  let q;
  if (category) {
    const snap = await getDocs(query(collection(db, "leadership_members"), orderBy("createdAt", "desc")));
    let docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    return docs.filter(d => d.type && d.type.toLowerCase() === category.toLowerCase());
  } else {
    q = query(collection(db, "leadership_members"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export async function getNotices() {
  if (!db) return [];
  const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getMagazines() {
  if (!db) return [];
  const q = query(collection(db, "magazines"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getResources() {
  if (!db) return [];
  const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export function normalizePartnerData(id: string, raw: any): Partner {
  const imageUrl = raw.imageUrl || raw.logoUrl || raw.image || raw.logo || '';
  const websiteUrl = raw.websiteUrl || raw.url || raw.link || raw.website || '';
  const name = raw.name || raw.title || raw.companyName || 'Partner';
  const category = raw.category || raw.type || 'Corporate Partner';
  const description = raw.description || raw.desc || raw.about || '';
  const order = typeof raw.order === 'number' ? raw.order : typeof raw.position === 'number' ? raw.position : 999;
  const position = typeof raw.position === 'number' ? raw.position : order;
  const displayInFrontend = raw.displayInFrontend !== false;
  const status = raw.status || 'published';

  return {
    id,
    ...raw,
    name,
    category,
    description,
    displayInFrontend,
    image: imageUrl,
    imageUrl,
    logo: imageUrl,
    logoUrl: imageUrl,
    order,
    position,
    status,
    websiteUrl,
    createdAt: raw.createdAt || Date.now(),
  };
}

export async function getPartners(): Promise<Partner[]> {
  if (!db) return [];
  const collectionsToTry = ['partners', 'partner', 'sponsors', 'collaborators'];
  const partnersMap = new Map<string, Partner>();

  for (const colName of collectionsToTry) {
    try {
      let snap;
      try {
        snap = await getDocs(query(collection(db, colName), orderBy('order', 'asc')));
      } catch {
        try {
          snap = await getDocs(query(collection(db, colName), orderBy('createdAt', 'desc')));
        } catch {
          snap = await getDocs(collection(db, colName));
        }
      }

      if (snap && !snap.empty) {
        snap.docs.forEach((docSnap) => {
          const raw = docSnap.data();
          const normalized = normalizePartnerData(docSnap.id, raw);
          if (
            normalized.displayInFrontend &&
            normalized.status !== 'draft' &&
            normalized.status !== 'archived' &&
            normalized.status !== 'hidden'
          ) {
            partnersMap.set(docSnap.id, normalized);
          }
        });
      }
    } catch (err) {
      console.warn(`Error querying partners from collection "${colName}":`, err);
    }
  }

  const list = Array.from(partnersMap.values());
  list.sort((a, b) => {
    if (a.order !== b.order) return (a.order ?? 999) - (b.order ?? 999);
    if (a.position !== b.position) return (a.position ?? 999) - (b.position ?? 999);
    return (b.createdAt ?? 0) - (a.createdAt ?? 0);
  });

  return list;
}

export function subscribePartners(onUpdate: (partners: Partner[]) => void): () => void {
  if (!db) return () => {};

  try {
    const q = collection(db, 'partners');
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Partner[] = [];
        snap.docs.forEach((docSnap) => {
          const raw = docSnap.data();
          const normalized = normalizePartnerData(docSnap.id, raw);
          if (
            normalized.displayInFrontend &&
            normalized.status !== 'draft' &&
            normalized.status !== 'archived' &&
            normalized.status !== 'hidden'
          ) {
            list.push(normalized);
          }
        });

        list.sort((a, b) => {
          if (a.order !== b.order) return (a.order ?? 999) - (b.order ?? 999);
          if (a.position !== b.position) return (a.position ?? 999) - (b.position ?? 999);
          return (b.createdAt ?? 0) - (a.createdAt ?? 0);
        });

        onUpdate(list);
      },
      (err) => {
        console.warn('Realtime listener error on partners:', err);
      }
    );
    return unsub;
  } catch (err) {
    console.warn('Failed to subscribe to partners collection:', err);
    return () => {};
  }
}

export async function getFaqs() {
  if (!db) return [];
  const collectionsToTry = ['faqs', 'faq', 'frequently_asked_questions', 'site_faqs', 'questions'];
  const faqMap = new Map<string, any>();

  for (const colName of collectionsToTry) {
    try {
      let snap;
      try {
        snap = await getDocs(query(collection(db, colName), orderBy('createdAt', 'desc')));
      } catch {
        snap = await getDocs(collection(db, colName));
      }

      if (snap && !snap.empty) {
        snap.docs.forEach((doc) => {
          const raw = doc.data() as any;
          if (raw.status !== 'draft' && raw.status !== 'archived') {
            const title = raw.question || raw.title || raw.heading || raw.q || 'Frequently Asked Question';
            const rawAnswer = raw.answer || raw.description || raw.bodyRichText || raw.content || raw.ans || raw.a || '';
            const answer = extractTextContent(rawAnswer);
            faqMap.set(doc.id, {
              id: doc.id,
              ...raw,
              title,
              question: title,
              description: answer,
              answer: answer,
              category: raw.category || 'General',
              order: typeof raw.order === 'number' ? raw.order : 0,
            });
          }
        });
      }
    } catch (e) {
      console.warn(`Querying FAQ collection ${colName} failed:`, e);
    }
  }

  const list = Array.from(faqMap.values());
  list.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
      return a.order - b.order;
    }
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return list;
}

export async function getGalleries() {
  if (!db) return [];
  const collectionsToTry = ['gallery_items', 'gallery', 'galleries', 'photos', 'site_gallery'];
  const map = new Map<string, any>();

  for (const colName of collectionsToTry) {
    try {
      let snap;
      try {
        snap = await getDocs(query(collection(db, colName), orderBy('createdAt', 'desc')));
      } catch {
        snap = await getDocs(collection(db, colName));
      }

      if (snap && !snap.empty) {
        snap.docs.forEach((doc) => {
          map.set(doc.id, { id: doc.id, ...doc.data() });
        });
      }
    } catch (e) {
      console.warn(`Querying gallery collection ${colName} failed:`, e);
    }
  }

  return Array.from(map.values());
}

export interface MembershipRecord {
  id: string;
  membershipId: string;
  fullName: string;
  name: string;
  batch: string | number;
  department: string;
  photoUrl: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  email?: string;
  phone?: string;
  bloodGroup?: string;
  status?: string;
  role?: string;
  designation?: string;
  issueDate?: string;
  validUntil?: string;
  session?: string;
  studentId?: string;
  description?: string;
  [key: string]: any;
}

export async function getMembership(queryStr: string): Promise<MembershipRecord | null> {
  if (!db || !queryStr) return null;
  const cleanQuery = queryStr.trim();

  const collectionsToTry = ["memberships", "members", "leadership_members"];

  for (const colName of collectionsToTry) {
    try {
      // 1. By membershipId
      let q = query(collection(db, colName), where("membershipId", "==", cleanQuery));
      let snap = await getDocs(q);

      // 2. By studentId
      if (snap.empty) {
        q = query(collection(db, colName), where("studentId", "==", cleanQuery));
        snap = await getDocs(q);
      }

      // 3. By email / emailAddress
      if (snap.empty) {
        q = query(collection(db, colName), where("email", "==", cleanQuery));
        snap = await getDocs(q);
      }
      if (snap.empty) {
        q = query(collection(db, colName), where("emailAddress", "==", cleanQuery));
        snap = await getDocs(q);
      }

      // 4. By document ID
      if (snap.empty) {
        q = query(collection(db, colName), where("__name__", "==", cleanQuery));
        snap = await getDocs(q);
      }

      if (!snap.empty) {
        const raw = snap.docs[0].data() as any;
        const fullName = raw.fullName || raw.name || raw.memberName || 'Society Member';
        const photoUrl = raw.photoUrl || raw.photo || raw.imageUrl || raw.avatar || `https://picsum.photos/seed/${encodeURIComponent(cleanQuery)}/400/400`;
        const batch = raw.batch !== undefined && raw.batch !== null ? raw.batch : (raw.batchNo || '');
        const department = raw.department || raw.dept || 'Debating Society of HSTU';
        const facebookUrl = raw.facebookUrl || raw.facebook || '';
        const linkedinUrl = raw.linkedinUrl || raw.linkedin || '';
        const email = raw.emailAddress || raw.email || '';
        const phone = raw.phone || raw.contact || raw.contactNo || '';
        const membershipId = raw.membershipId || raw.id || snap.docs[0].id;
        const status = raw.status || 'Active';
        const bloodGroup = raw.bloodGroup || raw.blood || '';
        const issueDate = raw.issueDate || raw.joinedDate || (raw.createdAt ? new Date(raw.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Active Member');

        return {
          id: snap.docs[0].id,
          ...raw,
          membershipId,
          fullName,
          name: fullName,
          batch,
          department,
          photoUrl,
          facebookUrl,
          linkedinUrl,
          email,
          phone,
          status,
          bloodGroup,
          issueDate,
        };
      }
    } catch (err) {
      console.error(`Error querying ${colName} for membership:`, err);
    }
  }
  return null;
}

export async function getCertificate(certificateId: string) {
  if (!db) return null;
  const q = query(collection(db, "certificates"), where("certificateId", "==", certificateId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getStaticPage(
  docIds: string | string[],
  collections: string[] = ["pages_static", "site_settings", "static_pages", "pages"]
) {
  if (!db) return null;
  const ids = Array.isArray(docIds) ? docIds : [docIds];
  
  for (const colName of collections) {
    for (const docId of ids) {
      try {
        const docRef = doc(db, colName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const markdownContent = data.contentMarkdown || data.content || data.bodyRichText || data.markdown || data.description || data.text || '';
          if (markdownContent || Object.keys(data).length > 0) {
            return {
              id: docSnap.id,
              contentMarkdown: markdownContent,
              updatedAt: data.updatedAt,
              ...data
            };
          }
        }
      } catch (err) {
        console.warn(`Could not fetch static doc ${docId} from ${colName}:`, err);
      }
    }
  }
  return null;
}

export function subscribeStaticPage(
  docIds: string | string[],
  onUpdate: (data: any) => void,
  collections: string[] = ["pages_static", "site_settings", "static_pages", "pages"]
) {
  if (!db) return () => {};
  const ids = Array.isArray(docIds) ? docIds : [docIds];
  const unsubs: (() => void)[] = [];

  for (const colName of collections) {
    for (const docId of ids) {
      try {
        const docRef = doc(db, colName, docId);
        const unsub = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const markdownContent = data.contentMarkdown || data.content || data.bodyRichText || data.markdown || data.description || data.text || '';
            onUpdate({
              id: docSnap.id,
              contentMarkdown: markdownContent,
              updatedAt: data.updatedAt,
              ...data
            });
          }
        }, (err) => {
          console.warn(`Realtime error for static page ${docId} on ${colName}:`, err);
        });
        unsubs.push(unsub);
      } catch (err) {
        console.warn(`Could not subscribe to ${docId} on ${colName}:`, err);
      }
    }
  }

  return () => {
    unsubs.forEach((u) => {
      try {
        u();
      } catch (e) {
        // ignore
      }
    });
  };
}

export async function getConstitution() {
  return getStaticPage(["constitution", "constitution_page", "rules"]);
}

export async function getHistory() {
  return getStaticPage(["history", "our_history", "history_page"]);
}

export async function getTermsOfService() {
  return getStaticPage(["terms_of_service", "terms", "tos", "termsofservice", "terms-of-service"]);
}

export async function getPrivacyPolicy() {
  return getStaticPage(["privacy_policy", "privacy", "privacypolicy", "privacy-policy", "policy"]);
}

export async function getLocation() {
  if (!db) return null;
  try {
    const qLocation = query(collection(db, "site_settings"), where("__name__", "==", "location"));
    const snapLocation = await getDocs(qLocation);
    const locationData = snapLocation.empty ? null : snapLocation.docs[0].data();

    const footer = await getFooterInfo();

    return { 
        id: "location", 
        mapIframe: locationData?.mapIframe,
        address: footer?.address || locationData?.address,
        ...locationData
    };
  } catch (e) {
    console.error("Failed to fetch location", e);
    return null;
  }
}

export interface FooterInfo {
  address?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  phone?: string;
  youtubeUrl?: string;
  updatedAt?: number;
  twitterUrl?: string;
  githubUrl?: string;
  siteName?: string;
  tagline?: string;
  description?: string;
  location?: string;
  newsletterUrl?: string;
  newsletterLabel?: string;
  copyrightText?: string;
  quickLinks?: { label: string; href: string }[];
  resourceLinks?: { label: string; href: string }[];
  [key: string]: any;
}

export const DEFAULT_FOOTER_INFO: FooterInfo = {
  address: "TSC, HSTU, Dinajpur 5200",
  email: "hstu.rs@gmail.com",
  facebookUrl: "https://www.facebook.com/hsturesearchsociety",
  instagramUrl: "https://www.instagram.com/iaasbd_hstu/",
  linkedinUrl: "https://linkedin.com/company/hstu-research-society",
  phone: "+880 1730-826594",
  youtubeUrl: "https://www.youtube.com/@hsturesearchsociety3168",
  siteName: "Debating Society of HSTU",
  description: "Fostering Talent and cultivating logical thinking within youths.",
  newsletterUrl: "https://forms.gle/3NG63JDYm9Qmgg379",
  newsletterLabel: "Join our Newsletter",
};

export function normalizeFooterData(raw: any): FooterInfo {
  if (!raw || typeof raw !== 'object') return {};

  const address = extractTextContent(
    raw.address || raw.location || raw.officeAddress || raw.officeLocation || raw.office || raw.addressText
  );

  const email = raw.email || raw.contactEmail || raw.mail || raw.supportEmail || raw.emailAddress || '';
  const phone = raw.phone || raw.contactPhone || raw.phoneNo || raw.contactNumber || raw.telephone || raw.mobile || '';
  const facebookUrl = raw.facebookUrl || raw.facebook || raw.fb || raw.fbUrl || '';
  const instagramUrl = raw.instagramUrl || raw.instagram || raw.insta || raw.instaUrl || '';
  const linkedinUrl = raw.linkedinUrl || raw.linkedin || raw.linkedinProfile || '';
  const youtubeUrl = raw.youtubeUrl || raw.youtube || raw.yt || raw.ytUrl || '';
  const twitterUrl = raw.twitterUrl || raw.twitter || raw.x || raw.xUrl || '';
  const githubUrl = raw.githubUrl || raw.github || '';

  const siteName = raw.siteName || raw.organizationName || raw.orgName || raw.title || raw.name || '';
  const description = extractTextContent(
    raw.description || raw.tagline || raw.slogan || raw.motto || raw.about || raw.contentMarkdown || raw.bodyRichText || raw.content || raw.bio
  );

  // Socials map/array fallback if individual fields not present
  const socials = raw.socialLinks || raw.socials || raw.social_links;
  let finalFb = facebookUrl;
  let finalInsta = instagramUrl;
  let finalLinkedin = linkedinUrl;
  let finalYt = youtubeUrl;
  let finalTwitter = twitterUrl;
  let finalGithub = githubUrl;

  if (socials && typeof socials === 'object' && !Array.isArray(socials)) {
    finalFb = finalFb || socials.facebook || socials.fb || '';
    finalInsta = finalInsta || socials.instagram || socials.insta || '';
    finalLinkedin = finalLinkedin || socials.linkedin || '';
    finalYt = finalYt || socials.youtube || socials.yt || '';
    finalTwitter = finalTwitter || socials.twitter || socials.x || '';
    finalGithub = finalGithub || socials.github || '';
  } else if (Array.isArray(socials)) {
    socials.forEach((item: any) => {
      if (!item) return;
      const platform = (item.platform || item.name || item.type || '').toLowerCase();
      const url = item.url || item.link || item.href || '';
      if (platform.includes('facebook') || platform === 'fb') finalFb = finalFb || url;
      if (platform.includes('instagram') || platform === 'insta') finalInsta = finalInsta || url;
      if (platform.includes('linkedin')) finalLinkedin = finalLinkedin || url;
      if (platform.includes('youtube') || platform === 'yt') finalYt = finalYt || url;
      if (platform.includes('twitter') || platform === 'x') finalTwitter = finalTwitter || url;
      if (platform.includes('github')) finalGithub = finalGithub || url;
    });
  }

  const newsletterUrl = raw.newsletterUrl || raw.newsletterLink || raw.googleFormUrl || raw.formUrl || raw.joinUrl || raw.newsletter || raw.registrationUrl || '';
  const newsletterLabel = raw.newsletterLabel || raw.newsletterText || raw.newsletterTitle || raw.actionText || '';
  const copyrightText = raw.copyrightText || raw.copyright || raw.footerText || '';
  const updatedAt = typeof raw.updatedAt === 'number' ? raw.updatedAt : raw.updatedAt?.toMillis?.() || undefined;

  let quickLinks: { label: string; href: string }[] | undefined = undefined;
  if (Array.isArray(raw.quickLinks || raw.quick_links)) {
    quickLinks = (raw.quickLinks || raw.quick_links).map((l: any) => ({
      label: l.label || l.title || l.name || '',
      href: l.href || l.url || l.link || '#'
    })).filter((l: any) => l.label);
  }

  let resourceLinks: { label: string; href: string }[] | undefined = undefined;
  if (Array.isArray(raw.resourceLinks || raw.resources || raw.resource_links)) {
    resourceLinks = (raw.resourceLinks || raw.resources || raw.resource_links).map((l: any) => ({
      label: l.label || l.title || l.name || '',
      href: l.href || l.url || l.link || '#'
    })).filter((l: any) => l.label);
  }

  return {
    ...raw,
    address: address || undefined,
    location: address || undefined,
    email: email || undefined,
    phone: phone || undefined,
    facebookUrl: finalFb || undefined,
    instagramUrl: finalInsta || undefined,
    linkedinUrl: finalLinkedin || undefined,
    youtubeUrl: finalYt || undefined,
    twitterUrl: finalTwitter || undefined,
    githubUrl: finalGithub || undefined,
    updatedAt,
    siteName: siteName || undefined,
    description: description || undefined,
    tagline: description || undefined,
    newsletterUrl: newsletterUrl || undefined,
    newsletterLabel: newsletterLabel || undefined,
    copyrightText: copyrightText || undefined,
    quickLinks: quickLinks && quickLinks.length > 0 ? quickLinks : undefined,
    resourceLinks: resourceLinks && resourceLinks.length > 0 ? resourceLinks : undefined,
  };
}

export const FOOTER_COLLECTIONS = ['site_settings', 'settings', 'footer', 'pages_static', 'static_pages'];
export const FOOTER_DOC_IDS = ['footer', 'general', 'contact', 'socials', 'info', 'main'];

export async function getFooterInfo(): Promise<FooterInfo> {
  if (!db) return DEFAULT_FOOTER_INFO;

  // 1. Primary check: direct document site_settings / footer
  try {
    const docRef = doc(db, 'site_settings', 'footer');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const normalized = normalizeFooterData(data);
      return { ...DEFAULT_FOOTER_INFO, ...normalized };
    }
  } catch (e) {
    console.warn('Error querying site_settings/footer directly:', e);
  }

  // 2. Fallback check on other collections if site_settings/footer was not found
  const mergedData: any = { ...DEFAULT_FOOTER_INFO };

  for (const colName of FOOTER_COLLECTIONS) {
    for (const docId of FOOTER_DOC_IDS) {
      try {
        const docRef = doc(db, colName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const normalized = normalizeFooterData(data);
          for (const [k, v] of Object.entries(normalized)) {
            if (v !== undefined && v !== '') {
              mergedData[k] = v;
            }
          }
        }
      } catch {
        // Continue silently
      }
    }
  }

  return mergedData;
}

export function subscribeFooterInfo(onUpdate: (info: FooterInfo) => void) {
  if (!db) return () => {};

  const unsubs: (() => void)[] = [];
  const cache: Record<string, any> = {};

  const triggerUpdate = () => {
    const combined: any = { ...DEFAULT_FOOTER_INFO };
    for (const data of Object.values(cache)) {
      const normalized = normalizeFooterData(data);
      for (const [k, v] of Object.entries(normalized)) {
        if (v !== undefined && v !== '') {
          combined[k] = v;
        }
      }
    }
    onUpdate(combined);
  };

  // Listen directly to site_settings/footer with highest priority
  try {
    const primaryRef = doc(db, 'site_settings', 'footer');
    const unsubPrimary = onSnapshot(
      primaryRef,
      (docSnap) => {
        if (docSnap.exists()) {
          cache['primary'] = docSnap.data();
          triggerUpdate();
        }
      },
      (err) => {
        console.warn('Realtime listener error on site_settings/footer:', err);
      }
    );
    unsubs.push(unsubPrimary);
  } catch (err) {
    console.warn('Could not subscribe to site_settings/footer:', err);
  }

  // Also listen to any secondary documents
  for (const colName of FOOTER_COLLECTIONS) {
    for (const docId of FOOTER_DOC_IDS) {
      if (colName === 'site_settings' && docId === 'footer') continue; // already subscribed above
      try {
        const docRef = doc(db, colName, docId);
        const unsub = onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              cache[`${colName}/${docId}`] = docSnap.data();
              triggerUpdate();
            }
          },
          () => {}
        );
        unsubs.push(unsub);
      } catch {
        // ignore
      }
    }
  }

  return () => {
    unsubs.forEach((u) => {
      try {
        u();
      } catch {
        // ignore
      }
    });
  };
}
