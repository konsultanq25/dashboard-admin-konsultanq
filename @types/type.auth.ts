export interface Register {
  name: string;
  phone: string;
  email: string;
  password: string;
  password_confirmation: string;
  roles: string;
}

export interface Login {
  email: string;
  password: string;
}
