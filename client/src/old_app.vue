<script>
export default {
  data() {
    return {
      name: "John Doe",
      status: true,
      trades: [
        { inCur: "BTC", outCur: "USD", inAmt: 0.12, outAmt: 10000 },
        { inCur: "ETH", outCur: "USD", inAmt: 1, outAmt: 3100 },
      ],
      portfolioURL: "https://coinmarketcap.com",
    };
  },
  methods: {
    toggleStatus() {
      this.status = !this.status;
    },
  },
};
</script>

<template>
  <h1>Welcome to Diablogical, {{ name }}</h1>
  <p v-if="status">You are logged in</p>
  <p v-else>You are not logged in</p>
  <ul>
    <li v-for="trade in trades">
      <p>{{ trade.inCur }} to {{ trade.outCur }}</p>
      <p>
        {{ trade.inAmt }} to {{ trade.outAmt }} (${{
          trade.outAmt / trade.inAmt
        }})
      </p>
    </li>
  </ul>
  <a :href="portfolioURL">Check out your portfolio</a>
  <button @click="toggleStatus">Toggle Status</button>
</template>
