// components/sop-wizard/sop-wizard.js
Component({
  properties: {
    data: {
      type: Object,
      value: null,
      observer: function(newVal) {
        if (newVal && newVal.preps) {
          this.setData({
            currentStep: -1
          });
        }
      }
    }
  },

  data: {
    currentStep: -1 // -1: Prep, 0..N: Steps, 'finished': Done
  },

  methods: {
    startSop() {
      // Optional: Check if all preps are done? PRD doesn't strictly force it, but good UX.
      // For now, just let them proceed.
      this.setData({ currentStep: 0 });
    },

    nextStep() {
      const steps = this.data.data.steps;
      if (this.data.currentStep < steps.length - 1) {
        this.setData({ currentStep: this.data.currentStep + 1 });
      } else {
        this.setData({ currentStep: 'finished' });
      }
    },

    prevStep() {
      if (this.data.currentStep > 0) {
        this.setData({ currentStep: this.data.currentStep - 1 });
      } else {
        this.setData({ currentStep: -1 });
      }
    },

    reviewSop() {
      this.setData({ currentStep: 0 });
    }
  }
})
