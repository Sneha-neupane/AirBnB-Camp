<template>
  <div>
    <h2 v-if="!selectedCampsite">All Campsites</h2>
    <div v-if="!selectedCampsite">
      <div class="filter-section">
        <h3>Filter by Amenities</h3>
        <div class="amenities-list">
          <div v-for="amenity in amenities" :key="amenity.id" class="amenity-checkbox">
            <input type="checkbox" :id="'amenity-' + amenity.id" :value="amenity.id" v-model="selectedAmenities">
            <label :for="'amenity-' + amenity.id">{{ amenity.name }}</label>
          </div>
        </div>

        <h3>Filter by Country</h3>
        <div class="country-dropdown">
          <select v-model="selectedCountry">
            <option value="">All Countries</option>
            <option v-for="country in uniqueCountries" :key="country" :value="country">{{ country }}</option>
          </select>
        </div>

        <div class="filter-buttons">
          <button @click="filterCampsites" class="filter-button">Apply Filters</button>
          <button @click="resetFilters" class="filter-button">Reset Filters</button>
        </div>
      </div>
      <div class="campsite-container">
        <div class="campsite-card" v-for="campsite in filteredCampsites" :key="campsite.id">
          <img :src="campsite.image" alt="Campsite Image" class="campsite-image" />
          <div class="campsite-details">
            <h3>{{ campsite.name }}</h3>
            <p>{{ campsite.description }}</p>
            <p><strong>Price: </strong>{{ formatPrice(campsite.price) }}</p>
            <p><strong>Address: </strong>{{ campsite.address }}</p>
            <p><strong>City: </strong>{{ campsite.city }}</p>
            <p><strong>Country: </strong>{{ campsite.country }}</p>
            <p><strong>Status: </strong>{{ campsite.status }}</p>
            <button v-if="campsite.status !== 'reserved'" @click="selectCampsite(campsite)" class="book-now-button">Book Now</button>
          </div>
        </div>
      </div>
      <p v-if="filteredCampsites.length === 0">No campsites found.</p>
    </div>

    <div v-if="selectedCampsite">
      <h2>Book Campsite</h2>
      <div class="booking-details">
        <h3>{{ selectedCampsite.name }}</h3>
        <p>{{ selectedCampsite.description }}</p>
        <p><strong>Price: </strong>{{ formatPrice(selectedCampsite.price) }}</p>
        <p><strong>Address: </strong>{{ selectedCampsite.address }}</p>
        <p><strong>City: </strong>{{ selectedCampsite.city }}</p>
        <p><strong>Country: </strong>{{ selectedCampsite.country }}</p>
        <form @submit.prevent="bookCampsite">
          <div>
            <label for="start-date">Start Date:</label>
            <input type="date" v-model="startDate" required />
          </div>
          <div>
            <label for="end-date">End Date:</label>
            <input type="date" v-model="endDate" required />
          </div>
          <button type="submit" class="book-now-button small">Book Now</button>
        </form>
        <button @click="deselectCampsite" class="back-button">Back to Campsite List</button>
      </div>

      <div class="review-section">
        <h2>Reviews</h2>
        <div v-if="reviews.length === 0" class="no-reviews">No reviews yet.</div>
        <div v-else>
          <div v-for="review in reviews" :key="review.id" class="review">
            <p><strong>{{ review.username }}</strong> rated: {{ review.rating }}/5</p>
            <p>{{ review.comment }}</p>
          </div>
        </div>
        <form @submit.prevent="addReview" class="review-form">
          <h3>Add a Review</h3>
          <div>
            <label for="rating">Rating:</label>
            <select v-model="newReview.rating" required>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          <div>
            <label for="comment">Comment:</label>
            <textarea v-model="newReview.comment" required></textarea>
          </div>
          <button type="submit" class="book-now-button small">Submit Review</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      campsites: [],
      amenities: [],
      selectedAmenities: [],
      filteredCampsites: [],
      selectedCountry: '',
      selectedCampsite: null,
      startDate: '',
      endDate: '',
      reviews: [],
      newReview: {
        rating: '',
        comment: ''
      }
    };
  },
  computed: {
    uniqueCountries() {
      const countries = this.campsites.map(campsite => campsite.country);
      return [...new Set(countries)];
    }
  },
  methods: {
    async fetchCampsites() {
      try {
        const [campsiteResponse, imageResponse] = await Promise.all([
          axios.get('https://localhost:5001/Campsite', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa('test:test')
            }
          }),
          axios.get('https://localhost:5001/Image', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa('test:test')
            }
          })
        ]);

        if (campsiteResponse.status === 200 && imageResponse.status === 200) {
          const images = imageResponse.data;

          const campsitesWithDetails = await Promise.all(campsiteResponse.data.map(async campsite => {
            try {
              const locationResponse = await axios.get(`https://localhost:5001/Location/${campsite.locationId}`, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic ' + btoa('test:test')
                }
              });
              const location = locationResponse.data;

              const campsiteImage = images.find(image => image.campsiteId === campsite.id);

              return {
                id: campsite.id,
                name: campsite.name,
                description: campsite.description,
                price: campsite.price,
                address: location.address,
                city: location.city,
                country: location.country,
                status: campsite.status,
                locationId: campsite.locationId,
                hostId: campsite.userId,
                image: campsiteImage ? campsiteImage.url : 'https://via.placeholder.com/150'
              };
            } catch (error) {
              console.error('Error fetching location data:', error);
              return null;
            }
          }));

          this.campsites = campsitesWithDetails.filter(campsite => campsite !== null);
          this.filteredCampsites = this.campsites;
        } else {
          console.error('Failed to fetch campsites or images:', campsiteResponse.data, imageResponse.data);
        }
      } catch (error) {
        console.error('Error fetching campsites or images:', error);
      }
    },
    async fetchAmenities() {
      try {
        const amenitiesResponse = await axios.get('https://localhost:5001/Amenity', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('test:test')
          }
        });

        if (amenitiesResponse.status === 200) {
          this.amenities = amenitiesResponse.data;
        } else {
          console.error('Failed to fetch amenities:', amenitiesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching amenities:', error);
      }
    },
    async filterCampsites() {
      try {
        const campsiteAmenitiesResponse = await axios.get('https://localhost:5001/CampingAmenity', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('test:test')
          }
        });

        if (campsiteAmenitiesResponse.status === 200) {
          const campsiteAmenities = campsiteAmenitiesResponse.data;
          const filteredCampsiteIds = campsiteAmenities
            .filter(ca => this.selectedAmenities.includes(ca.amenityId))
            .map(ca => ca.campsiteId);

          this.filteredCampsites = this.campsites.filter(campsite =>
            (this.selectedCountry === '' || campsite.country === this.selectedCountry) &&
            (this.selectedAmenities.length === 0 || filteredCampsiteIds.includes(campsite.id))
          );
        } else {
          console.error('Failed to fetch campsite amenities:', campsiteAmenitiesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching campsite amenities:', error);
      }
    },
    resetFilters() {
      this.selectedAmenities = [];
      this.selectedCountry = '';
      this.filteredCampsites = this.campsites;
    },
    async selectCampsite(campsite) {
      this.selectedCampsite = campsite;
      await this.fetchReviews(campsite.id);
    },
    deselectCampsite() {
      this.selectedCampsite = null;
      this.reviews = [];
    },
    async bookCampsite() {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          alert('No user is signed in.');
          return;
        }
        const user = JSON.parse(storedUser);

        const reservationResponse = await axios.post('https://localhost:5001/CampingReservation', {
          guestId: user.id,
          campsiteId: this.selectedCampsite.id,
          startDate: this.startDate,
          endDate: this.endDate
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('test:test')
          }
        });

        if (reservationResponse.status === 200) {
          const updateResponse = await axios.put(`https://localhost:5001/Campsite/${this.selectedCampsite.id}`, {
            id: this.selectedCampsite.id,
            name: this.selectedCampsite.name,
            description: this.selectedCampsite.description,
            pricePerNight: this.selectedCampsite.price,
            locationId: this.selectedCampsite.locationId,
            hostId: this.selectedCampsite.hostId,
            status: 'reserved'
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa('test:test')
            }
          });

          if (updateResponse.status === 200) {
            alert('Reservation successful and campsite status updated!');
            this.updateCampsiteStatus(this.selectedCampsite.id, 'reserved');
            this.deselectCampsite();
          } else {
            console.error('Failed to update campsite status:', updateResponse.data);
            alert('Failed to update campsite status.');
          }
        } else {
          console.error('Failed to book campsite:', reservationResponse.data);
          alert('Failed to book campsite.');
        }
      } catch (error) {
        console.error('Error booking campsite:', error);
        alert('An error occurred while booking the campsite.');
      }
    },
    updateCampsiteStatus(campsiteId, status) {
      const campsite = this.campsites.find(cs => cs.id === campsiteId);
      if (campsite) {
        campsite.status = status;
      }
    },
    async fetchReviews(campsiteId) {
      try {
        console.log(`Fetching reviews for campsiteId: ${campsiteId}`); 
        const reviewsResponse = await axios.get(`https://localhost:5001/Review/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('test:test')
          }
        });

        console.log('reviewsResponse.data:', reviewsResponse.data);

        let reviewsData = reviewsResponse.data;
        if (!Array.isArray(reviewsData)) {
          reviewsData = [reviewsData]; // Convert single object to array
        }
        reviewsData = reviewsData.filter(review => review.campsiteId === campsiteId);
        const reviewsWithUsernames = await Promise.all(reviewsData.map(async review => {
          try {
            const userResponse = await axios.get(`https://localhost:5001/User/${review.userId}`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa('test:test')
              }
            });
            const user = userResponse.data;

            return {
              id: review.id,
              userId: review.userId,
              campsiteId: review.campsiteId,
              comment: review.comment,
              rating: review.rating,
              username: user.username
            };
          } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
          }
        }));

        this.reviews = reviewsWithUsernames.filter(review => review !== null);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    },
    async addReview() {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          alert('No user is signed in.');
          return;
        }
        const user = JSON.parse(storedUser);

        const reviewResponse = await axios.post('https://localhost:5001/Review', {
          userId: user.id,
          campsiteId: this.selectedCampsite.id,
          comment: this.newReview.comment,
          rating: this.newReview.rating
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('test:test')
          }
        });

        if (reviewResponse.status === 200) {
          alert('Review submitted successfully!');
          // Add the new review to the reviews array and fetch the username
          const userResponse = await axios.get(`https://localhost:5001/User/${user.id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa('test:test')
            }
          });
          const reviewer = userResponse.data;
          this.reviews.push({
            id: reviewResponse.data.id,
            userId: user.id,
            campsiteId: this.selectedCampsite.id,
            comment: this.newReview.comment,
            rating: this.newReview.rating,
            username: reviewer.username
          });
          this.newReview.rating = '';
          this.newReview.comment = '';
        } else {
          console.error('Failed to submit review:', reviewResponse.data);
          alert('Failed to submit review.');
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('An error occurred while submitting the review.');
      }
    },
    formatPrice(price) {
      if (typeof price === 'number' && !isNaN(price)) {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
      } else {
        return 'N/A';
      }
    }
  },
  created() {
    this.fetchCampsites();
    this.fetchAmenities();
  }
};
</script>

<style scoped>
.campsite-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.campsite-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  width: 300px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  background-color: white;
  margin: 10px;
}

.campsite-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.campsite-details {
  padding: 20px;
}

.book-now-button {
  background-color: #333;
  color: white;
  padding: 5px 10px; /* Reduced padding */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  width: auto; /* Set width to auto */
}

.book-now-button.small {
  padding: 5px 10px; /* Smaller button size */
  
  
}

.book-now-button:hover {
  background-color: #555;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.back-button {
  margin-top: 20px;
  background-color: #555;
}

button {
  padding: 5px 10px; /* Reduced padding for all buttons */
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: auto; /* Set width to auto */
}

button:hover {
  background-color: #555;
}

.review-section {
  margin-top: 30px;
  padding: 20px; /* Add padding for border spacing */
  border: 1px solid #ddd; /* Add border */
  border-radius: 10px; 
}

.review {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.filter-section {
  margin-bottom: 20px;
  text-align: center; /* Center the filter section */
}

.amenities-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* Center the amenities list */
  gap: 10px;
}

.amenity-checkbox {
  display: flex;
  align-items: center;
  margin: 5px 10px 5px 0;
}

.country-dropdown {
  margin: 10px 0;
}

.filter-buttons {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 10px; /* Add gap between buttons */
}

.filter-button {
  padding: 10px 20px;
}
</style>
