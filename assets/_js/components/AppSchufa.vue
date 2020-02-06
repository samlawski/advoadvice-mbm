<template>
  <div>
    <p>{{currentBlock().text}}</p>

    <ul id="antworten">
      <li v-for="(option, index) in currentBlock().optionen" v-bind:key="index">
        <button>{{ option }}</button>
      </li>
    </ul>

  </div>
</template>

<script>
export default {
  name: 'AppSchufa',
  components: {},
  data(){
    return {
      repo: repoSchufa,
      index: 0,
      results: [
        repoSchufa[0]
      ]
    }
  },
  props: [],
  computed: {},
  methods: {
    currentBlock(){
      return this.results[this.index]
    }
  }
}
</script>

<style lang="scss" scoped>
ul {
  padding-left: 0;
}
li {
  list-style: none;
}
</style>