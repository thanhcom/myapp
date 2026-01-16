export interface Account {
  id: number;

  username: string;
  password: string; // ⚠️ chỉ dùng nội bộ, KHÔNG nên render UI

  fullname: string;
  email: string;
  phone: string | null;

  birthday: string | null; // ISO string: "1989-02-06"
  active: boolean;

  datecreate: string;   // ISO timestamp
  last_update: string;  // ISO timestamp
}
