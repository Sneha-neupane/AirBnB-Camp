<template>
  <div>
    <h2>Overview of Campsites</h2>
    <table v-if="campsites.length">
      <thead>
        <tr>
          <th>Campsite Name</th>
          <th>Address</th>
          <th>City</th>
          <th>Country</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="campsite in campsites" :key="campsite.id">
          <td>{{ campsite.name }}</td>
          <td>{{ campsite.address }}</td>
          <td>{{ campsite.city }}</td>
          <td>{{ campsite.country }}</td>
          <td>{{ campsite.status }}</td>
          <td>
            <button @click="confirmDelete(campsite)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>No campsites found.</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      campsites: []
    };
  },
  methods: {
    async fetchCampsites() {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const { data: allCampsites } = await axios.get('https://localhost:5001/Campsite', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa('test:test')
            }
          });

          const userCampsites = allCampsites.filter(campsite => campsite.userId === user.id);

          const detailedCampsites = await Promise.all(userCampsites.map(async campsite => {
            try {
              const { data: location } = await axios.get(`https://localhost:5001/Location/${campsite.locationId}`, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic ' + btoa('test:test')
                }
              });

              return {
                id: campsite.id,
                name: campsite.name,
                address: location.address,
                city: location.city,
                country: location.country,
                status: campsite.status,
                locationId: campsite.locationId
              };
            } catch (error) {
              console.error('Error fetching location data:', error);
              return null;
            }
          }));

          this.campsites = detailedCampsites.filter(campsite => campsite !== null);
        } else {
          console.error('No user is signed in.');
        }
      } catch (error) {
        console.error('Error fetching campsites:', error);
      }
    },
    async confirmDelete(campsite) {
      if (confirm("Are you sure you want to delete this campsite and all associated data? This action cannot be undone.")) {
        await this.deleteCampsite(campsite);
        this.fetchCampsites();
      }
    },
    async deleteCampsite(campsite) {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('test:test')
        };

        // Delete associated amenities
        await this.deleteCampingAmenities(campsite.id, headers);

        // Delete associated reviews
        await this.deleteAssociatedData('Review', 'campsiteId', campsite.id, headers);

        // Delete associated images
        await this.deleteAssociatedData('Image', 'campsiteId', campsite.id, headers);

        // Delete the campsite
        await axios.delete(`https://localhost:5001/Campsite/${campsite.id}`, { headers });

        // Delete the location associated with the campsite
        await axios.delete(`https://localhost:5001/Location/${campsite.locationId}`, { headers });

        alert("Campsite and associated data deleted successfully.");
      } catch (error) {
        console.error('Error deleting campsite:', error);
        alert("An error occurred while deleting the campsite.");
      }
    },
    async deleteCampingAmenities(campsiteId, headers) {
      try {
        // Fetch all amenities associated with the campsiteId
        const { data: amenities } = await axios.get(`https://localhost:5001/CampingAmenity`, { headers });
        
        // Filter amenities by campsiteId
        const filteredAmenities = amenities.filter(amenity => amenity.campsiteId === campsiteId);

        // Delete each amenity one by one
        for (const amenity of filteredAmenities) {
          try {
            await axios.delete(`https://localhost:5001/CampingAmenity/${amenity.id}`, { headers });
            console.log(`Deleted amenity with ID: ${amenity.id}`);
          } catch (error) {
            console.error(`Error deleting amenity with ID: ${amenity.id}`, error);
          }
        }

        console.log(`Deleted all amenities for campsiteId=${campsiteId}`);
      } catch (error) {
        console.error('Error fetching or deleting campsite amenities:', error);
      }
    },
    async deleteAssociatedData(resource, filterKey, filterValue, headers) {
      try {
        const { data: items } = await axios.get(`https://localhost:5001/${resource}`, { headers });

        const filteredItems = items.filter(item => item[filterKey] === filterValue);
        console.log(`Deleting ${filteredItems.length} ${resource} records for ${filterKey}=${filterValue}`);
        for (const item of filteredItems) {
          try {
            console.log(`Deleting ${resource} with ID: ${item.id}`);
            await axios.delete(`https://localhost:5001/${resource}/${item.id}`, { headers });
          } catch (error) {
            console.error(`Error deleting ${resource} with ID: ${item.id}`, error);
          }
        }
      } catch (error) {
        console.error(`Error deleting ${resource}:`, error);
      }
    }
  },
  created() {
    this.fetchCampsites();
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
