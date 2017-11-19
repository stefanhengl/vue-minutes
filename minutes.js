require('vue');
var dateFormat = require('dateformat');

function immutablePush(arr, newEntry) {
    return [...arr, newEntry]
}

Vue.component('bubble', {
    template: `
    <div>
        <transition name="fade">
            <p v-if="show" class="timeStamp">{{stamp}}</p>
        </transition>
        <textarea class="bubble" @keydown="inputHandler" :id=id v-model="msg"></textarea>
    </div>
    `,
    props: ['id'],
    data: function () {
        return {
            msg: "",
            id_: this.id,
            stamp: "",
            show: false
        }
    },
    methods: {
        inputHandler(e) {
            console.log(e.keyCode)
            if ((e.metaKey || e.ctrlKey) && e.keyCode == 13) {
                console.log("command shift")
                this.submitForm();
                this.show = true;
                app.$emit('newField', this.id_)
                var k = parseInt(this.id_) + 1
                Vue.nextTick(function () {
                    console.log("setting focus", k)
                    document.getElementById(k).focus()
                })
            }
        },
        submitForm() {
            console.log("submit form")
            app.$emit('submitContent', this.msg, this.id_)
            var now = new Date();
            this.stamp = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
        },
    }
})


app = new Vue({
    el: '#app',
    data: {
        texts: {},
        items: [{ id: 1 }]
    },
    created() {
        this.$on('submitContent', function (msg, id) {
            console.log('Event from parent component emitted', msg, id)
            this.texts = Object.assign({}, this.texts, { [id]: msg })
        });
        this.$on('newField', function (id) {
            console.log("adding new field")
            let numberOfFields = this.items.length
            if (parseInt(id) === numberOfFields) {
                this.items = immutablePush(this.items, { id: numberOfFields + 1 })
            }
        })
    },

})
