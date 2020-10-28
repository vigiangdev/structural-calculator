<template>
  <div class="map">
    <div class="google-map" id="map"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {
    seismicValues() {
      return this.$store.state.seismicValues;
    }
  },
  methods: {
    initMap() {
      var map = new window.google.maps.Map(document.getElementById("map"), {
        center: {
          lat: this.seismicValues.parameters.latitude,
          lng: this.seismicValues.parameters.longitude
        },
        zoom: 14,
        streetViewControl: false,
        gestureHandling: "cooperative"
      });

      new window.google.maps.Marker({
        position: {
          lat: this.seismicValues.parameters.latitude,
          lng: this.seismicValues.parameters.longitude
        },
        map: map,
        title: "Hello World!"
      });
    }
  },
  created() {
    this.$store.watch(
      state => {
        return this.$store.state.seismicValues.parameters.latitude;
      },
      (newValue, oldValue) => {
        this.initMap();
      },
      {
        deep: true
      }
    );
    this.$store.watch(
      state => {
        return this.$store.state.seismicValues.parameters.longitude;
      },
      (newValue, oldValue) => {
        this.initMap();
      },
      {
        deep: true
      }
    );
  },
  mounted() {
    this.initMap();
  }
};
</script>

<style scoped>
.map {
  width: 100%;
  height: 300px;
  position: relative;
}
.google-map {
  position: absolute;
  width: 100%;
  height: 300px;
  margin: 0 auto;
}
</style>