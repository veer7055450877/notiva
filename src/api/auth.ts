import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

const USERS_API_URL = 'https://69b6f01bffbcd02860943a7e.mockapi.io/api/v1/users';

// Fallback local storage for users in case MockAPI /users endpoint is not created
const getLocalUsers = (): User[] => JSON.parse(localStorage.getItem('notiva_users') || '[]');
const saveLocalUsers = (users: User[]) => localStorage.setItem('notiva_users', JSON.stringify(users));

export const authApi = {
  async login(email: string, password: string):Promise<User> {
    try {
      const res = await fetch(USERS_API_URL);
      if (!res.ok) throw new Error('MockAPI users endpoint not found');
      const users: User[] = await res.json();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) throw new Error('Invalid email or password');
      return { id: user.id, name: user.name, email: user.email };
    } catch (error) {
      // Fallback to local storage
      const users = getLocalUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) throw new Error('Invalid email or password');
      return { id: user.id, name: user.name, email: user.email };
    }
  },

  async signup(name: string, email: string, password: string):Promise<User> {
    const newUser = { id: uuidv4(), name, email, password };

    try {
      // Check if user exists
      const res = await fetch(USERS_API_URL);
      if (res.ok) {
        const users: User[] = await res.json();
        if (users.some(u => u.email === email)) throw new Error('Email already exists');

        const createRes = await fetch(USERS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        if (!createRes.ok) throw new Error('Failed to create user');
        const createdUser = await createRes.json();
        return { id: createdUser.id, name: createdUser.name, email: createdUser.email };
      } throw new Error('MockAPI users endpoint not found');
    } catch (error: any) {
      if (error.message === 'Email already exists') throw error;

      // Fallback to local storage
      const users = getLocalUsers();
      if (users.some(u => u.email === email)) throw new Error('Email already exists');
      saveLocalUsers([...users, newUser]);
      return { id: newUser.id, name: newUser.name, email: newUser.email };
    }
  }
};
