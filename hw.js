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

app = new Vue({
    el: '#app',
    data: {
        texts: {}
    },
	created() {
		this.$on('subsub', function(msg, id){
            console.log('Event from parent component emitted', msg, id)
            this.texts = Object.assign({}, this.texts, {[id]: msg})
		});
	},

    })
