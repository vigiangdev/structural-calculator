import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import router from "@/router/index.js";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  state: {
    isAuthenticated: false,
    user: {
      name: null,
      email: null,
    },
    token: null,
    status: null,
    seismicValues: {
      parameters: null,
      results: null,
    },
  },
  mutations: {
    resetSeismicValues(state) {
      state.seismicValues.results = null;
    },
    calcSeismicValues(state, payload) {
      state.seismicValues.parameters = payload.res.data.request.parameters;
      state.seismicValues.parameters.referenceDocument =
        payload.res.data.request.referenceDocument;
      state.seismicValues.parameters.address = payload.address;
      state.seismicValues.results = payload.res.data.response.data;
    },
    updateAuth(state, payload) {
      state.user.name = payload.data.user.name;
      state.user.email = payload.data.user.email;
      state.token = payload.token;
      state.status = payload.status;
    },
  },
  actions: {
    async calcSeismicValues(context, payload) {
      await axios({
        method: "get",
        url: `https://earthquake.usgs.gov/ws/designmaps/${payload.queryParams.reference}.json?latitude=${payload.queryParams.latitude}&longitude=${payload.queryParams.longitude}&riskCategory=${payload.queryParams.riskCategory}&siteClass=${payload.queryParams.siteClass}&title=${payload.queryParams.title}`,
      })
        .then((response) => {
          context.commit("calcSeismicValues", {
            res: response,
            address: payload.queryAddress,
          });
        })
        .catch((err) => {
          console.error(err);
        });
    },
    async authRequestLogin(context, payload) {
      try {
        const res = await axios.post(
          `${process.env.VUE_APP_API}/api/v1/users/login`,
          payload,
          { withCredentials: true }
        );
        context.commit("updateAuth", res.data);
        router.push({ name: "home" });
      } catch (err) {
        console.log(err);
      }
    },
    async authRequestSignup(context, payload) {
      try {
        const res = await axios.post(
          `${process.env.VUE_APP_API}/api/v1/users/signup`,
          payload,
          { withCredentials: true }
        );
        context.commit("updateAuth", res.data);
        router.push({ name: "home" });
      } catch (err) {
        console.log(err);
      }
    },
  },

  modules: {},
});
