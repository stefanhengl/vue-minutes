require('vue');
var dateFormat = require('dateformat');

function immutablePush(arr, newEntry) {
    return [...arr, newEntry]
}

Vue.component('bubble', {
    template: `
    <div class="bubbleContainer">
        <transition name="fade">
            <p v-if="show" class="timeStamp">{{stamp}}</p>
        </transition>
        <div v-bind:class="{ bubble: true, foc: isFocused }">
            <textarea @keydown="inputHandler" :id=id v-model="msg"></textarea>
            <div class="timeOfDay">
                {{timeOfDay}}
            </div>
        </div>
    </div>
    `,
    props: ['id', 'lastknowndate'],
    data: function () {
        return {
            msg: "",
            id_: this.id,
            stamp: "",
            show: false,
            timeOfDay: "",
            isFocused: true,
            lastKnownDate_: this.lastknowndate,
        }
    },
    methods: {
        inputHandler(e) {
            // console.log(e.keyCode)
            // Handle submit
            if ((e.metaKey || e.ctrlKey) && e.keyCode == 13) {
                console.log("command shift")
                this.submitForm();
                app.$emit('newField', this.id_)
            
                // after a submit, the focus should change to the next element
                var k = parseInt(this.id_) + 1
                this.isFocused = false;
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
            this.stamp = dateFormat(now, "dddd, mmmm dS, h TT");
            this.timeOfDay = dateFormat(now, "hh:MM TT")

            // Display date on top of bubble on if hours has changed
            if (this.lastKnownDate_ !== this.stamp) {
                this.show = true;
                app.$emit('rememberDate', this.stamp)
            }
        },
    }
})


app = new Vue({
    el: '#app',
    data: {
        texts: {},
        items: [{ id: 1 }],
        date: ""
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
        });
        this.$on('rememberDate', function(date) {
            console.log('remembering:', date)
            this.date = date
        })
    },

})
