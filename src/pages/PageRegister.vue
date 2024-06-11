<template>
  <div class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="register">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" v-model="username" id="username" required>
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" id="email" required>
      </div>
      <div class="form-group">
        <label for="firstname">First Name:</label>
        <input type="text" v-model="firstname" id="firstname" required>
      </div>
      <div class="form-group">
        <label for="lastname">Last Name:</label>
        <input type="text" v-model="lastname" id="lastname" required>
      </div>
      <div class="form-group">
        <label for="type">Type:</label>
        <select v-model="type" id="type" required>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" v-model="password" id="password" required>
      </div>
      <button type="submit" class="register-button">Register</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      email: '',
      firstname: '',
      lastname: '',
      type: 'user', // Default to 'user'
      password: ''
    };
  },
  methods: {
    async register() {
      const user = {
        username: this.username,
        email: this.email,
        firstName: this.firstname,
        lastName: this.lastname,
        type: this.type,
        password: this.password
      };

      try {
        const response = await axios.post('https://localhost:5001/User', user, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('test:test')
          }
        });

        if (response.status === 200) {
          alert('User registered successfully!');
          this.$emit('registered');
          // Clear the form
          this.username = '';
          this.email = '';
          this.firstname = '';
          this.lastname = '';
          this.type = 'user'; // Reset to default
          this.password = '';
        } else {
          console.error('Failed to register user:', response.data);
          alert('Failed to register user: ' + (response.data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error registering user');
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  max-width: 500px;
  margin: 0 auto;
  margin-top: 10px;
  padding: 2em;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Caudex', serif;
  text-align: center;
}

h2 {
  margin-bottom: 1em;
}

.form-group {
  margin-bottom: 1.5em;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5em;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
}

.register-button {
  width: 100%;
  padding: 0.75em;
  background-color: black;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s;
}

.register-button:hover {
  background-color: #a65149;
}
</style>
