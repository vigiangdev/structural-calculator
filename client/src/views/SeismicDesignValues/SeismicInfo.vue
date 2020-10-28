<template>
  <div class="container">
    <h1>Seismic Design Map</h1>
    <div class="form mt-4">
      <form class>
        <div class="form-row">
          <div class="col-lg-4 mb-2">
            <label class="sr-only" for="reference">Reference</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">Reference</div>
              </div>
              <select
                v-model="query.params.reference"
                class="custom-select"
                id="reference"
                required
              >
                <option
                  v-for="option in query.reference.options"
                  v-bind:key="option.query"
                  v-bind:value="option.query"
                >{{ option.name }}</option>
              </select>
            </div>
          </div>
          <div class="col-lg-4 mb-2">
            <label class="sr-only" for="risk-category">Risk Category</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">Risk Category</div>
              </div>
              <select
                v-model="query.params.riskCategory"
                class="custom-select"
                id="risk-category"
                required
              >
                <option
                  v-for="(option, index) in query.riskCategory.options"
                  v-bind:key="index"
                  v-bind:value="option"
                >{{ option }}</option>
              </select>
            </div>
          </div>
          <div class="col-lg-4 mb-2">
            <label class="sr-only" for="site-class">Site Class</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">Site Class</div>
              </div>
              <select
                v-model="query.params.siteClass"
                class="custom-select"
                id="site-class"
                required
              >
                <option
                  v-for="option in query.siteClass.options"
                  v-bind:key="option.query"
                  v-bind:value="option.query"
                >{{ option.name }}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="col-lg-4 mb-2">
            <label class="sr-only" for="title">Project Title</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">Project Title</div>
              </div>
              <input
                v-model="query.params.title"
                type="text"
                class="form-control"
                id="title"
                placeholder="(Optional)"
              />
            </div>
          </div>
          <div class="input-group col-lg-7 mb-2">
            <label class="sr-only" for="location">Location</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <select v-model="locationType" class="input-group-text" id="location" required>
                  <option value="address">Address</option>
                  <option value="coordinates">Coordinates</option>
                </select>
              </div>
              <input
                v-on:keyup="getLatLong(queryAddress.address)"
                v-model="queryAddress.address"
                v-if="locationType === 'address'"
                type="text"
                aria-label="Address"
                class="form-control"
              />
              <input
                v-if="locationType === 'coordinates'"
                v-on:keyup="queryAddress.address = null"
                v-model="query.params.latitude"
                placeholder="Latitude"
                type="text"
                aria-label="Latitude"
                class="form-control"
              />
              <input
                v-if="locationType === 'coordinates'"
                v-model="query.params.longitude"
                v-on:keyup="queryAddress.address = null"
                placeholder="Longitude"
                type="text"
                aria-label="Longitude"
                class="form-control"
              />
            </div>
            <div v-if="addressDropdown" class="position-relative w-100 address">
              <ul class="list-group">
                <li
                  v-for="(address, index) in queryAddress.addressList"
                  v-bind:key="index"
                  class="list-group-item address-item"
                  v-on:mouseover="addressHover = true"
                  v-on:mouseleave="addressHover = false"
                  v-on:click="selectAddress"
                >{{address.formatted_address}}</li>
              </ul>
            </div>
          </div>
          <div class="col-lg-1">
            <button v-on:click.prevent="getSeismicValues" class="btn btn-primary">Submit</button>
          </div>
        </div>
      </form>

      <div v-if="feedback" class="alert alert-danger mt-4">
        <h3>Error:</h3>
        <p>{{ feedback }}</p>
      </div>

      <div v-if="seismicValues.results" class="displayResults">
        <GoogleMap id="google" class="mt-4" />
        <table class="mt-4 table table-bordered table-sm">
          <thead class="thead-dark">
            <tr>
              <th class="address">Project Details</th>
              <th>Value</th>
            </tr>
          </thead>
          <tr v-for="(value, name) in seismicValues.parameters" v-bind:key="name">
            <td>{{ query.queryName[name] }}</td>
            <td>{{ value }}</td>
          </tr>
        </table>
        <table class="mt-4 table table-bordered table-sm">
          <thead class="thead-dark">
            <tr>
              <th class="type">Type</th>
              <th class="value">Value</th>
              <th class="description">Description</th>
            </tr>
          </thead>
          <tr v-for="(seismicVal, seismicVar) in seismicVars.primary" v-bind:key="seismicVal.var">
            <td v-html="seismicVal.var"></td>
            <td v-if="seismicValues.results[seismicVar]">{{ seismicValues.results[seismicVar] }}</td>
            <td
              v-else
            >{{ JSON.stringify(seismicValues.results[seismicVar]) }} - {{ seismicValues.results['fv_note'] }}</td>
            <td>{{ seismicVal.description }}</td>
          </tr>
        </table>
        <table class="mt-4 table table-bordered table-sm">
          <thead class="thead-dark">
            <tr>
              <th class="type">Type</th>
              <th class="value">Value</th>
              <th class="description">Description</th>
            </tr>
          </thead>
          <tr v-for="(seismicVal, seismicVar) in seismicVars.secondary" v-bind:key="seismicVal.var">
            <td v-html="seismicVal.var"></td>
            <td v-if="seismicValues.results[seismicVar]">{{ seismicValues.results[seismicVar] }}</td>
            <td
              v-else
            >{{ JSON.stringify(seismicValues.results[seismicVar]) }} - {{ seismicValues.results['fv_note'] }}</td>
            <td>{{ seismicVal.description }}</td>
          </tr>
        </table>
      </div>
      <div class="col-lg-4 mb-2"></div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import axios from "axios";
import GoogleMap from "@/components/GoogleMap.vue";

export default {
  components: {
    GoogleMap
  },
  data() {
    return {
      addressDropdown: false,
      locationType: "address",
      feedback: null,
      query: {
        params: {
          reference: "asce7-16",
          riskCategory: "II",
          siteClass: "D",
          latitude: null,
          longitude: null,
          title: null
        },
        queryName: {
          address: "Address",
          referenceDocument: "Reference Document",
          riskCategory: "Risk Category",
          siteClass: "Site Class",
          longitude: "Longitude",
          latitude: "Latitude",
          title: "Title"
        },
        reference: {
          options: [
            { query: "asce7-16", name: "ASCE7-16" },
            { query: "asce7-10", name: "ASCE7-10" },
            { query: "asce41-17", name: "ASCE41-17" },
            { query: "asce41-13", name: "ASCE41-13" },
            { query: "ibc-2015", name: "IBC-2015" },
            { query: "ibc-2012", name: "IBC-2012" },
            { query: "nehrp-2015", name: "NEHRP-2015" },
            { query: "nehrp-2009", name: "NEHRP-2009" }
          ]
        },
        riskCategory: {
          options: ["I", "II", "III", "IV"]
        },
        siteClass: {
          options: [
            { query: "A", name: "A - Hard Rock" },
            { query: "B", name: "B - Rock" },
            { query: "C", name: "C - Very Dense Soil and Soft Rock" },
            { query: "D", name: "D - Stiff Soil" },
            { query: "E", name: "E - Soft Clay Soil" },
            { query: "F", name: "F - Site Response Analysis" }
          ]
        }
      },
      queryAddress: {
        address: null,
        addressList: null
      },
      seismicVars: {
        primary: {
          ss: {
            description: "MCER ground motion (0.2 s)",
            var: "<span>S<sub>S</sub></span>"
          },
          s1: {
            description: "MCER ground motion (1.0 s)",
            var: "<span>S<sub>1</sub></span>"
          },
          sms: {
            description: "Site-modified spectral acceleration value (0.2 s)",
            var: "<span>S<sub>MS</sub></span>"
          },
          sm1: {
            description: "Site-modified spectral acceleration value (1.0 s)",
            var: "<span>S<sub>M1</sub></span>"
          },
          sds: {
            description: "Numeric seismic design value (0.2 s)",
            var: "<span>S<sub>DS</sub></span>"
          },
          sd1: {
            description: "Numeric seismic design value (1.0 s)",
            var: "<span>S<sub>D1</sub></span>"
          }
        },
        secondary: {
          cr1: {
            description:
              "Mapped value of the risk coefficient at a period of 1 s",
            var: "<span>C<sub>R1</sub></span>"
          },
          crs: {
            description:
              "Mapped value of the risk coefficient at short periods",
            var: "<span>C<sub>RS</sub></span>"
          },
          fa: {
            description: "Site amplification factor (0.2 s)",
            var: "<span>F<sub>a</sub></span>"
          },
          fpga: {
            description: "Site amplification factor at PGA",
            var: "<span>F<sub>PGA</sub></span>"
          },
          fv: {
            description: "Site amplification factor (1.0 s)",
            var: "<span>F<sub>v</sub></span>"
          },
          // fv_note: { description: "Note for site amplification factor at 1.0 second", var: '<span><sub></sub></span>' },
          pga: {
            description: "MCEG peak ground acceleration",
            var: "<span>PGA</span>"
          },
          pgad: {
            description:
              "Factored deterministic acceleration value (Peak Ground Acceleration)",
            var: "<span>PGA<sub>D</sub></span>"
          },
          pgam: {
            description: "Site modified peak ground acceleration",
            var: "<span>PGA<sub>M</sub></span>"
          },
          pgauh: {
            description:
              "Uniform-hazard (2% probability of exceedance in 50 years) Peak Ground Acceleration",
            var: "<span>PGA<sub>UH</sub></span>"
          },
          s1d: {
            description: "Factored deterministic acceleration value (1.0 s)",
            var: "<span>S<sub>1D</sub></span>"
          },
          s1rt: {
            description: "Probabilistic risk-targeted ground motion (1.0 s)",
            var: "<span>S<sub>1RT</sub></span>"
          },
          s1uh: {
            description:
              "Factored uniform-hazard (2% probability of exceedance in 50 years) spectral acceleration (1.0 s)",
            var: "<span>S<sub>1UH</sub></span>"
          },
          sdc: {
            description: "Seismic design category from SDCS and SDC1",
            var: "<span>SDC</span>"
          },
          // sdc1: { description: "Seismic design category from SD1", var: '<span><sub></sub></span>' },
          // sdcs: { description: "Seismic design category from SDS", var: '<span><sub></sub></span>' },
          ssd: {
            description: "Factored deterministic acceleration value (0.2 s)",
            var: "<span>S<sub>SD</sub></span>"
          },
          ssrt: {
            description: "Probabilistic risk-targeted ground motion (0.2 s)",
            var: "<span>S<sub>SRT</sub></span>"
          },
          ssuh: {
            description:
              "Factored uniform-hazard (2% probability of exceedance in 50 years) spectral acceleration (0.2 s)",
            var: "<span>S<sub>SUH</sub></span>"
          },
          tl: {
            description: "Long-period transition period in seconds",
            var: "<span>T<sub>L</sub></span>"
          }
        }
      }
    };
  },
  computed: {
    seismicValues() {
      return this.$store.state.seismicValues;
    }
    // ...mapGetters(["seismicValues"])
  },
  methods: {
    // ...mapActions(["calcSeismicValues"]),
    getSeismicValues() {
      this.feedback = null;
      if (
        this.locationType === "coordinates" &&
        (!this.query.params.latitude || !this.query.params.longitude)
      ) {
        this.feedback = "Please fill in the latitude and longitude fields.";
        this.$store.commit("resetSeismicValues");
        return;
      }

      // if (
      //   (this.locationType === "address" && typeof(this.seismicValues.parameters.address) !== undefined)
      //   (!this.queryAddress.address ||
      //     this.queryAddress.address !== this.seismicValues.parameters.address)
      // ) {
      //   this.feedback = "Please fill in the address field.";
      //   this.$store.commit("resetSeismicValues");
      //   return;
      // }

      if (
        !this.query.params.reference ||
        !this.query.params.riskCategory ||
        !this.query.params.siteClass ||
        !this.query.params.latitude ||
        !this.query.params.longitude
      ) {
        this.feedback = "Please fill in all required fields.";
        this.$store.commit("resetSeismicValues");
        return;
      }

      if (this.query.params.siteClass === "F") {
        this.feedback =
          "A site response analysis shall be performed in accordance with ASCE/SEI 7 section 21.1 for structures on Site Class F sites. If your structure is exempted under ASCE/SEI 7 Section 20.3.1, select a substitute site class.";
        this.$store.commit("resetSeismicValues");
        return;
      }

      this.$store.dispatch("calcSeismicValues", {
        queryParams: this.query.params,
        queryAddress: this.queryAddress.address
      });
    },
    getLatLong() {
      this.addressDropdown = false;
      if (this.queryAddress.address) {
        this.addressDropdown = true;
        axios
          .get("https://maps.googleapis.com/maps/api/geocode/json", {
            params: {
              address: this.queryAddress.address,
              key: "AIzaSyD85znGpumn-7y-Bffdf_NLcn_JP4JYQao"
            }
          })
          .then(res => {
            this.queryAddress.addressList = res.data.results;
          })
          .catch(err => console.error(err));
      } else {
        this.queryAddress.addressList = null;
      }
    },
    selectAddress(event) {
      this.queryAddress.address = event.target.innerHTML;
      const address = this.queryAddress.addressList.find(address => {
        return address.formatted_address === this.queryAddress.address;
      });
      this.query.params.latitude = address.geometry.location.lat;
      this.query.params.longitude = address.geometry.location.lng;
      this.addressDropdown = false;
    }
  }
};
</script>

<style scoped>
.address {
  z-index: 1;
}
.address .address-item {
  cursor: pointer;
}
table tr .address {
  width: 275px;
}
table tr .type {
  width: 75px;
}
table tr .value {
  width: 200px;
}
</style>