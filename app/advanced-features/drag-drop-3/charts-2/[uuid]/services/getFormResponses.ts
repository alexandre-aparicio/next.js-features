// /lib/api/getFormResponses.ts

export interface FormResponse {
  id: number;
  form_id: string;
  user_id?: string;
  session_id: string;
  responses: { [key: string]: string };
  created_at: string;
}

interface ApiResponse {
  items: FormResponse[];
}

export async function getFormResponses(uuid: string): Promise<FormResponse[]> {
  const url = `http://93.127.135.52:6011/form-responses/form/${uuid}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  const data: ApiResponse = await res.json();
  return data.items || [];
}
