<template>
  <h1>{{test}}</h1>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      test: "Test neues Schufatool"
    }
  }
})
</script>

<style lang="scss" scoped>
.container {
  color: green;
}
</style>