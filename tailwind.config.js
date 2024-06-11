<template>
  <div class="home-container">
    <div class="image-container"></div>
    <div class="content">
      <h1 class="main-heading">Discover New Adventures</h1>
      <p class="description">
        Welcome to our camping community! We're excited to offer you the ultimate camping experience for your next adventure. Join us on a journey to discover hidden woodland gems, top-rated RV parks, and more. Our team is here to help you plan and book your next epic adventure, so let's get started!
      </p>
      <button v-if="isSignedIn && !isAdmin" class="action-button" @click="handleButtonClick">
        Book Now
      </button>
      <button v-else-if="!isSignedIn" class="action-button" @click="handleButtonClick">
        Sign In to Book
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageHome',
  props: {
    isSignedIn: {
      type: Boolean,
      required: true
    },
    isAdmin: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    handleButtonClick() {
      if (this.isSignedIn) {
        this.$emit('navigate', 'booking');
      } else {
        this.$emit('navigate', 'signin');
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Caudex:wght@400;700&display=swap');

.home-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
  font-family: 'Caudex', serif;
  color: black;
  padding: 20px;
  box-sizing: border-box;
}

.image-container {
  background-image: url('../assets/kamping-in-croatia.jpeg');
  background-size: cover;
  background-position: center;
  width: 50%;
  height: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.content {
  padding: 40px;
  width: 40%;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-left: -20px; /* Overlap to make it look better */
  text-align: left;
  z-index: 1;
  position: relative;
}

.main-heading {
  font-size: 2.5em;
  margin-bottom: 20px;
  font-weight: 700;
}

.description {
  font-size: 1.1em;
  margin-bottom: 20px;
}

.action-button {
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: #2980b9;
}
</style>
