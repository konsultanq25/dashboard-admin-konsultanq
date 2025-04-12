export interface CreateAgents {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export interface CreateBlogsPost {
  title: string;
  slug: string;
  content: string;
  image?: string | null;
  alt_image?: string | null;
  author?: string | null;
  categories?: string | null;
  status: "draft" | "published" | "archived";
  tags?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
}
