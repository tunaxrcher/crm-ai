import { userRepository } from "./repository";

export interface User {
  id: number;
  name?: string | null;
  phone?: string | null;
  profilePic?: string | null;
  createdAt: string;
  updatedAt: string;
}

// export type User = Awaited<ReturnType<typeof userRepository.findAll>>[number]

export type UserDetails = NonNullable<
  Awaited<ReturnType<typeof userRepository.findById>>
>;
