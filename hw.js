require('vue');

Vue.component('lala', {
    template: '<textarea @keydown="inputHandler"  key="doe" value="doe" v-model="msg"></textarea>',
    props: ['id'],
    data: function() {
        return {
            msg: "",
            id_: this.id}
    },
    methods: {
        inputHandler(e) {
            console.log(e.keyCode)
            if ((e.metaKey || e.ctrlKey) && e.keyCode == 13) {
                console.log("command shift")
                app.$emit('newField')
            }
            else if (e.keyCode === 13) {
                e.preventDefault();
                this.submitForm();
            }
        },
        submitForm() {
            console.log("submit form")                
            app.$emit('subsub', this.msg, this.id_)
        }
      }
})

function immutablePush(arr, newEntry){
    return [ ...arr, newEntry ]      
  }

app = new Vue({
    el: '#app',
    data: {
        texts: {},
        items: [{id: 1}]
    },
	created() {
		this.$on('subsub', function(msg, id){
            console.log('Event from parent component emitted', msg, id)
            this.texts = Object.assign({}, this.texts, {[id]: msg})
        });
        this.$on('newField', function() {
            console.log("adding new field")
            this.items = immutablePush(this.items, {id:this.items.length +1})
        })
	},

    })
