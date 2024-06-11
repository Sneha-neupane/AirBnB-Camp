<template>
  <div class="form-container">
    <h2>Add Location</h2>
    <form @submit.prevent="addLocation" class="form-section">
      <div class="form-group">
        <label for="address">Address:</label>
        <input type="text" v-model="location.address" required />
      </div>
      <div class="form-group">
        <label for="city">City:</label>
        <input type="text" v-model="location.city" required />
      </div>
      <div class="form-group">
        <label for="country">Country:</label>
        <input type="text" v-model="location.country" required />
      </div>
      <div class="form-group">
        <label for="latitude">Latitude:</label>
        <input type="number" step="0.0001" v-model="location.latitude" required />
      </div>
      <div class="form-group">
        <label for="longitude">Longitude:</label>
        <input type="number" step="0.0001" v-model="location.longitude" required />
      </div>
      <button type="submit" class="submit-button">Add Location</button>
    </form>

    <div v-if="step === 2">
      <h2>Add Campsite</h2>
      <form @submit.prevent="addCampsite" class="form-section">
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" v-model="campsite.name" required />
        </div>
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea v-model="campsite.description" required></textarea>
        </div>
        <div class="form-group">
          <label for="price">Price Per Night:</label>
          <input type="number" step="0.01" v-model="campsite.price" required />
        </div>
        <div class="form-group">
          <label for="locationId">Location ID:</label>
          <input type="text" v-model="campsite.locationId" readonly />
        </div>
        <div class="form-group">
          <label for="userId">User ID:</label>
          <input type="text" v-model="campsite.userId" readonly />
        </div>
        <button type="submit" class="submit-button">Add Campsite</button>
      </form>
    </div>

    <div v-if="step === 3">
      <h2>Select Amenities</h2>
      <form @submit.prevent="addAmenityToCampsite" class="form-section">
        <div class="form-group">
          <label for="existingAmenities">Choose Existing Amenities:</label>
          <div class="checkbox-group">
            <label v-for="amenity in amenities" :key="amenity.id">
              <input type="checkbox" :value="amenity.id" v-model="selectedAmenities" />
              {{ amenity.name }}
            </label>
          </div>
        </div>
        <button type="submit" class="submit-button">Add Amenities</button>
      </form>
      <div v-if="newAmenityId" class="info-message">
        <p>Recently added Amenity ID: {{ newAmenityId }}</p>
      </div>
      <div v-if="campsiteId" class="info-message">
        <p>Recently added Campsite ID: {{ campsiteId }}</p>
      </div>
    </div>

    <div v-if="step === 4">
      <h2>Add Image</h2>
      <form @submit.prevent="addImageUrl" class="form-section">
        <div class="form-group">
          <label for="image">Image URL:</label>
          <input type="text" v-model="image.url" placeholder="Image URL" required />
        </div>
        <button type="submit" class="submit-button">Add Image</button>
      </form>
    </div>

    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<script>
import axios from 'axios';
axios.defaults.withCredentials = true;

export default {
  data() {
    return {
      step: 1,
      location: {
        address: '',
        city: '',
        country: '',
        latitude: null,
        longitude: null,
      },
      campsite: {
        name: '',
        description: '',
        price: null,
        locationId: null,
        userId: null,
        status: 'free' // Set default status
      },
      amenities: [],
      selectedAmenities: [], // Changed to allow multiple selections
      newAmenityId: null, // Store the newly added amenity ID
      campsiteId: null, // Store the recently added campsite ID
      user: null,
      message: '',
      image: {
        url: ''
      } // Store the image URL
    };
  },
  async created() {
    await this.fetchUser();
    await this.fetchAmenities();
    // Set userId from the fetched user data
    if (this.user) {
      this.campsite.userId = this.user.id;
    } else {
      console.error('User state is not available');
    }
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
          console.log('Fetched user:', this.user);
        } else {
          this.message = 'No user is signed in.';
        }
      } catch (error) {
        console.error('Error fetching user information:', error);
        this.message = 'Error fetching user information.';
      }
    },
    async fetchAmenities() {
      try {
        const response = await axios.get('https://localhost:5001/Amenity', {
          headers: {
            'Authorization': 'Basic ' + btoa('test:test')
          }
        });
        this.amenities = response.data;
        console.log('Fetched amenities:', this.amenities);
      } catch (error) {
        console.error('Error fetching amenities:', error);
      }
    },
    async addLocation() {
      try {
        const response = await axios.post('https://localhost:5001/Location', this.location, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('test:test')
          },
          withCredentials: true // Ensure credentials are sent
        });
        console.log('Location added:', response);

        // Wait for 2 seconds before fetching the location ID
        setTimeout(async () => {
          try {
            const locationResponse = await axios.get('https://localhost:5001/Location', {
              params: {
                address: this.location.address,
                city: this.location.city,
                country: this.location.country,
                latitude: this.location.latitude,
                longitude: this.location.longitude
              },
              headers: {
                'Authorization': 'Basic ' + btoa('test:test')
              },
              withCredentials: true
            });

            console.log('Location response:', locationResponse.data);

            if (locationResponse.data && locationResponse.data.length > 0) {
              // Find the location with the maximum ID
              const latestLocation = locationResponse.data.reduce((max, loc) => loc.id > max.id ? loc : max);
              this.campsite.locationId = latestLocation.id; // Set the location ID from the response
              console.log('Location ID set to:', this.campsite.locationId);
              this.step = 2; // Move to the next step to add campsite
            } else {
              alert('Error retrieving location ID');
            }
          } catch (error) {
            console.error('Error fetching location ID:', error);
            if (error.response) {
              console.error('Error response data:', error.response.data);
              console.error('Error response status:', error.response.status);
              console.error('Error response headers:', error.response.headers);
            }
            alert('Error fetching location ID');
          }
        }, 2000); // Wait for 2 seconds (adjust as needed)

      } catch (error) {
        console.error('Error adding location:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
        }
        alert('Error adding location');
      }
    },
    async addCampsite() {
      // Ensure userId is set from the fetched user data
      if (!this.campsite.userId && this.user) {
        this.campsite.userId = this.user.id;
      }

      try {
        const response = await axios.post('https://localhost:5001/Campsite', this.campsite, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('test:test')
          },
          withCredentials: true // Ensure credentials are sent
        });
        console.log('Campsite added:', response);
        this.campsiteId = response.data.id; // Set the campsite ID from the response
        alert('Campsite added successfully');
        this.step = 3; // Move to the next step to add amenities
      } catch (error) {
        console.error('Error adding campsite:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
        }
        alert('Error adding campsite');
      }
    },
    async addAmenityToCampsite() {
      if (this.selectedAmenities.length > 0) {
        // Find the latest added campsite
        try {
          const campsiteResponse = await axios.get('https://localhost:5001/Campsite', {
            headers: {
              'Authorization': 'Basic ' + btoa('test:test')
            },
            withCredentials: true
          });

          // Find the campsite with the highest ID (assuming it's the latest)
          const latestCampsite = campsiteResponse.data.reduce((max, campsite) => campsite.id > max.id ? campsite : max, { id: -1 });

          if (latestCampsite.id !== -1) {
            this.campsiteId = latestCampsite.id;

            // Associate each selected amenity with the latest campsite
            for (const amenityId of this.selectedAmenities) {
              const campingAmenity = {
                campsiteId: this.campsiteId,
                amenityId: amenityId
              };
              await axios.post('https://localhost:5001/CampingAmenity', campingAmenity, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic ' + btoa('test:test')
                }
              });
            }
            console.log('Amenities associated with campsite');
            alert('Amenities added to campsite successfully');
            this.step = 4; // Move to the next step to add image URL
          } else {
            alert('Error: Could not find the recently added campsite.');
          }
        } catch (error) {
          console.error('Error associating amenities with campsite:', error);
          alert('Error adding amenities to campsite');
        }
      } else {
        alert('Please select one or more amenities.');
      }
    },
    async addImageUrl() {
      if (!this.image.url || !this.campsiteId) {
        alert('Please provide an image URL and ensure a campsite is created.');
        return;
      }

      try {
        const response = await axios.post('https://localhost:5001/Image', {
          url: this.image.url,
          campsiteId: this.campsiteId
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('test:test')
          }
        });
        console.log('Image URL posted:', response.data);
        alert('Campsite and image added successfully');
        this.resetForm();
      } catch (error) {
        console.error('Error adding image URL:', error);
        alert('Error adding image URL');
      }
    },
    resetForm() {
      this.step = 1;
      this.location = {
        address: '',
        city: '',
        country: '',
        latitude: null,
        longitude: null,
      };
      this.campsite = {
        name: '',
        description: '',
        price: null,
        locationId: null,
        userId: null,
        status: 'free'
      };
      this.amenities = [];
      this.selectedAmenities = []; // Reset to allow multiple selections
      this.newAmenityId = null;
      this.campsiteId = null;
      this.image = { url: '' };
      this.message = '';
      this.fetchAmenities();
    }
  },
};
</script>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Caudex', serif;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  font-weight: bold;
}

.form-section {
  margin-bottom: 40px;
}

.form-group {
  margin-bottom: 1em;
}

label {
  display: block;
  margin-bottom: 0.5em;
  font-weight: bold;
}

input, textarea, select {
  width: 100%;
  padding: 0.5em;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
}

textarea {
  resize: vertical;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  margin-right: 10px;
  margin-bottom: 10px;
}

.submit-button {
  padding: 10px 20px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: block;
  margin: 0 auto;
  font-weight: bold;
}

.submit-button:hover {
  background-color: #a65149;
}

.message, .info-message {
  text-align: center;
  margin-top: 20px;
  font-size: 1em;
  color: #e74c3c;
}
</style>
