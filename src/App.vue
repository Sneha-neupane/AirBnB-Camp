<template>
  <div id="app">
    <nav>
      <img src="./assets/camplogo.png" alt="Camp Logo" class="nav-logo" />
      <ul class="nav-list">
        <li
          v-for="page in filteredPages"
          :key="page"
          @click="setActivePage(page)"
          :class="{ active: activePage === page }"
        >
          {{ page }}
        </li>
        <li v-if="isSignedIn" @click="signout" :class="{ active: false }">
          Signout
        </li>
      </ul>
    </nav>

    <PageHome
      v-if="activePage === 'Home'"
      :isSignedIn="isSignedIn"
      :isAdmin="isAdmin"
      @navigate="setActivePage"
    />
    <PageBooking v-if="activePage === 'Booking' && isSignedIn && !isAdmin" />
    <PageSignin v-if="activePage === 'Signin'" @signed-in="handleSignIn" @navigate="setActivePage" />
    <PageRegister v-if="activePage === 'Register'" @registered="handleRegister" @navigate="setActivePage" />
    <PageProfile v-if="activePage === 'Profile' && isSignedIn" />
    <PageReservations v-if="activePage=== 'Reservations' && isSignedIn && !isAdmin"/>
    <PageAddCampsite v-if="activePage === 'AddCampsite' && isSignedIn && isAdmin" />
    <PageOverviewCampsite v-if="activePage== 'CampsiteOverview' && isSignedIn && isAdmin"/>
  </div>
</template>

<script>
import axios from 'axios';
import PageHome from './pages/PageHome.vue';
import PageBooking from './pages/PageBooking.vue';
import PageSignin from './pages/PageSignin.vue';
import PageRegister from './pages/PageRegister.vue';
import PageProfile from './pages/PageProfile.vue';
import PageReservations from './pages/PageReservations.vue';
import PageAddCampsite from './pages/PageAddCampsite.vue';
import PageOverviewCampsite from './pages/PageOverviewCampsite.vue';

export default {
  name: 'App',
  components: {
    PageHome,
    PageBooking,
    PageSignin,
    PageRegister,
    PageProfile,
    PageReservations,
    PageAddCampsite,
    PageOverviewCampsite
  },
  data() {
    return {
      pages: [
        'Home',
        'Booking',
        'Signin',
        'Register',
        'Profile',
        'Reservations',
        'AddCampsite',
        'CampsiteOverview'
      ],
      activePage: 'Home',
      isSignedIn: false,
      isAdmin: false
    };
  },
  computed: {
    filteredPages() {
      return this.pages.filter(page => {
        if (!this.isSignedIn) {
          return page !== 'Booking' && page !== 'Profile' && page !== 'Reservations' && page !== 'AddCampsite' && page !== 'CampsiteOverview';
        }
        if (this.isAdmin) {
          return page !== 'Booking' && page !== 'Reservations' && page !== 'Signin' && page !== 'Register';
        }
        return page !== 'Signin' && page !== 'Register' && page !== 'AddCampsite' && page !== 'CampsiteOverview';
      });
    }
  },
  methods: {
    setActivePage(page) {
      this.activePage = page;
    },
    async handleSignIn() {
      this.isSignedIn = true;
      await this.checkUserType();
      this.setActivePage('Home');
    },
    handleRegister() {
      this.setActivePage('Signin');
    },
    signout() {
      localStorage.removeItem('user');
      this.isSignedIn = false;
      this.isAdmin = false;
      this.setActivePage('Signin');
    },
    async checkUserType() {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        this.isSignedIn = false;
        this.isAdmin = false;
        return;
      }

      const user = JSON.parse(storedUser);
      try {
        const response = await axios.get(`https://localhost:5001/User/${user.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('test:test')
          }
        });
        if (response.status === 200) {
          this.isAdmin = response.data.type === 'admin';
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  },
  async created() {
    await this.checkUserType();
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Caudex:wght@400;700&display=swap');

body, html {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  font-family: 'Caudex', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/* Navigation Bar Styles */
nav {
  background-color: #F2F2F2;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  height: 50px; 
  width: 170px;
  border-radius: 10px;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  font-family: 'Caudex', serif;
}

.nav-list li {
  margin-left: 20px;
  cursor: pointer;
  position: relative;
  padding: 0 10px;
  font-size: 25px;
}

.nav-list li.active,
.nav-list li:hover {
  text-decoration: underline;
}
</style>
