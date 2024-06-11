<template>
  <div class="profile-container">
    <h2>User Profile</h2>
    <form @submit.prevent="updateProfile" class="profile-form">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" v-model="user.username" id="username" required>
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="user.email" id="email" required>
      </div>
      <div class="form-group">
        <label for="firstname">First Name:</label>
        <input type="text" v-model="user.firstName" id="firstname" required>
      </div>
      <div class="form-group">
        <label for="lastname">Last Name:</label>
        <input type="text" v-model="user.lastName" id="lastname" required>
      </div>
      <div class="form-group">
        <label for="type">Type:</label>
        <input type="text" v-model="user.type" id="type" required disabled>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" v-model="user.password" id="password" required>
      </div>
      <button type="submit" class="update-button">Update Profile</button>
    </form>
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      user: {
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        type: '',
        password: ''
      },
      message: ''
    };
  },
  methods: {
    async fetchUser() {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const response = await axios.get(`https://localhost:5001/User/${user.id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa('test:test')
            }
          });
          this.user = response.data;
        } else {
          this.message = 'No user is signed in.';
        }
      } catch (error) {
        console.error('Error fetching user information:', error);
        this.message = 'Error fetching user information.';
      }
    },
    
    async updateProfile() {
      try {
        const response = await axios.put(`https://localhost:5001/User/${this.user.id}`, this.user, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('test:test')
          }
        });

        if (response.status === 200) {
          localStorage.setItem('user', JSON.stringify(this.user));
          this.message = 'Profile updated successfully!';
        } else {
          console.error('Failed to update profile:', response.data);
          this.message = 'Failed to update profile: ' + (response.data.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        this.message = 'Error updating profile.';
      }
    }
  },
  created() {
    this.fetchUser();
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.profile-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1em;
}

label {
  display: block;
  margin-bottom: 0.5em;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.5em;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
}

.update-button {
  padding: 10px 20px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.update-button:hover {
  background-color: #a65149;
}

.message {
  text-align: center;
  margin-top: 20px;
  font-size: 1em;
  color: #e74c3c;
}
</style>
