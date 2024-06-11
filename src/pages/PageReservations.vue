<template>
  <div>
    <h2>Your Reservations</h2>
    <table v-if="reservations.length">
      <thead>
        <tr>
          <th>Campsite Name</th>
          <th>Address</th>
          <th>City</th>
          <th>Country</th>
          <th>Price (€)</th>
          <th>Start Date</th>
          <th>End Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reservation in reservations" :key="reservation.id">
          <td>{{ reservation.campsiteName }}</td>
          <td>{{ reservation.address }}</td>
          <td>{{ reservation.city }}</td>
          <td>{{ reservation.country }}</td>
          <td>{{ formatPrice(reservation.price) }}</td>
          <td>{{ formatDate(reservation.startDate) }}</td>
          <td>{{ formatDate(reservation.endDate) }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No reservations found.</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      reservations: []
    };
  },
  methods: {
    async fetchReservations() {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const reservationsResponse = await axios.get(`https://localhost:5001/CampingReservation/ByGuest?guestId=${user.id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa('test:test')
            }
          });

          if (reservationsResponse.status === 200) {
            const reservations = await Promise.all(reservationsResponse.data.map(async reservation => {
              try {
                const campsiteResponse = await axios.get(`https://localhost:5001/Campsite/${reservation.campsiteId}`, {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('test:test')
                  }
                });
                const campsite = campsiteResponse.data;

                const locationResponse = await axios.get(`https://localhost:5001/Location/${campsite.locationId}`, {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('test:test')
                  }
                });
                const location = locationResponse.data;

                return {
                  id: reservation.id,
                  campsiteName: campsite.name,
                  address: location.address,
                  city: location.city,
                  country: location.country,
                  price: campsite.price,
                  startDate: reservation.startDate,
                  endDate: reservation.endDate
                };
              } catch (error) {
                console.error('Error fetching campsite or location data:', error);
                return null;
              }
            }));

            this.reservations = reservations.filter(reservation => reservation !== null);
          } else {
            console.error('Failed to fetch reservations:', reservationsResponse.data);
          }
        } else {
          console.error('No user is signed in.');
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    },
    formatPrice(price) {
      if (typeof price === 'number' && !isNaN(price)) {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
      } else {
        return 'N/A';
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    }
  },
  created() {
    this.fetchReservations();
  }
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #f2f2f2;
}
</style>
