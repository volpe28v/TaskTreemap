<template>
  <ul>
    <li v-for="taskMap in taskMapList">{{taskMap.id}}</li>
  </ul>
</template>

<style>

</style>

<script>
var axios = require("axios");

module.exports = {

  data: function(){
    return {
      taskMapList: [],
    }
  },

  mounted: function(){
    var self = this;

    axios.get('all_maps')
      .then(function(result){
        self.taskMapList = result.data;
      });
  }
}
</script>

