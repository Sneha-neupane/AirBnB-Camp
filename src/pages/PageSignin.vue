<template>
  <div class="signin-container">
    <h2>Sign In</h2>
    <form @submit.prevent="signin">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" v-model="username" id="username" required>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" v-model="password" id="password" required>
      </div>
      <button type="submit" class="signin-button">Sign In</button>
    </form>
    <p v-if="message" class="message">{{ message }}</p>
    <p class="register-text">Don't have an account? <button @click="$emit('navigate', 'Register')" class="register-button">Register now</button></p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      message: ''
    };
  },
  methods: {
    async signin() {
      try {
        const response = await axios.get('https://localhost:5001/User', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('test:test')
          }
        });

        if (response.status === 200) {
          const users = response.data;
          const user = users.find(user => user.username === this.username && user.password === this.password);

          if (user) {
            this.message = 'Signed in successfully!';
            localStorage.setItem('user', JSON.stringify(user));
            this.$emit('signed-in');
            // Clear the form
            this.username = '';
            this.password = '';
          } else {
            this.message = 'Incorrect username or password';
          }
        } else {
          console.error('Failed to fetch users:', response.data);
          this.message = 'Failed to sign in: ' + (response.data.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Error:', error);
        this.message = 'Error signing in';
      }
    }
  }
};
</script>

<style scoped>
.signin-container {
  max-width: 400px;
  margin: 0 auto;
  margin-top: 40px;
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

.form-group input {
  width: 100%;
  padding: 0.5em;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
}

.signin-button {
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

.signin-button:hover {
  background-color: #a65149;
}

.message {
  margin-top: 1em;
  color: red;
}

.register-text {
  margin-top: 1em;
}

.register-button {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-size: 1em;
  font-family: 'Caudex', serif;
}

.register-button:hover {
  color: #2980b9;
}
</style>
