<template>
  <ul>
    <li v-for="taskMap in taskMapList">{{taskMap.id}}</li>
  </ul>
</template>

<style>

</style>

<script>

module.exports = {

  data: function(){
    return {
      taskMapList: [],
    }
  },

  mounted: function(){
    var self = this;

    // dummy data
    self.taskMapList = [
      { id: "hoge" },
      { id: "fuga" },
    ];
  }
}
</script>

