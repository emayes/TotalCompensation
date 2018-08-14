"use strict";
// load google charts
google.charts.load('current', {'packages':['corechart']})

var app = new Vue({
    el: "#app",
    data: {
        colEmail: '',
        screenSize: 5,
        employeeData: {
			FirstName: '',
			LastName: '',
			Position: '',
			PayRate: '',
			HireDate: '',
			ReviewDate: '',
			DeptDesc: '',
			Medicare: ''
		},
		compData: [],
		ttlSalary: 0
		
    },

    
    // start the app once the DOM is rendered
    mounted: function() {
		
		$('.parallax').parallax();
		
		setTimeout(function(){ 
			app.fetchValues();
		}, 100)
		
		
    },
	computed: {
		
		hoursTotal: function() {
			var sum = 0
			this.compData.forEach(function(row) {
				if (row.Type == 'HOURS') {sum+= row.Amt
				}
			})
			return sum
		},
		
		benefitsTotal: function() {
			var sum = 0
			this.compData.forEach(function(row) {
				if (row.Type == 'BENEFIT') {sum+= row.Amt
				}
			})
			return sum
		},
		
		deductionsTotal: function() {
			var sum = 0
			this.compData.forEach(function(row) {
				if (row.Type == 'DEDUCTION') {sum+= row.Amt
				}
			})
			return sum
		},
		
		taxTotal: function() {
			var sum = 0
			this.compData.forEach(function(row) {
				if (row.Type == 'TAX') {sum+= row.Amt
				}
			})
			return sum
		},
		
		taxTotalMedicare: function() {
			var sum = 0
			this.compData.forEach(function(row) {
				if (row.Code == 'MEDICARE') {
					sum+= row.Amt
				}
			})
			return sum
		},
		
		cityTtl: function() {
			var sum = app.hoursTotal + app.benefitsTotal + app.taxTotalMedicare //City matches Medicare Amt
			return sum
		},

		empTtl: function() {
			var sum = app.deductionsTotal
			return sum
		},
		
		ttlComp: function() {
			var sum = app.cityTtl + app.empTtl
			return sum
		}
			 
	},
    methods: {
       
        fetchValues: function() {
            axios.get('http://ax1vnode1.cityoflewisville.com/v2/?webservice=TotalCompensationGET', {
			params: {
				employeeEmail: localStorage.colEmail
			}
			}).then(function(e) {
					
					
					app.employeeData.FirstName = e.data.Employee[0].FirstName
					app.employeeData.LastName = e.data.Employee[0].LastName
					app.employeeData.Position = e.data.Employee[0].PositionTitle
					app.employeeData.PayRate = e.data.Employee[0].RateAmount
					app.employeeData.HireDate = e.data.Employee[0].HireDate
					app.employeeData.ReviewDate = e.data.Employee[0].ReviewDate
					app.employeeData.DeptDesc = e.data.Employee[0].DepartmentDesc
                    app.compData = e.data.Check
					
                    app.initResizeListener()
					
					app.colEmail = localStorage.colEmail; // Get employee email from OAUTH
					
					//draw the pie chart
					app.drawCharts();
                })
        },

        initResizeListener: function() {
            app.setScreenSize()	;
			
			
            $(window).resize(function() {
                app.setScreenSize()
				app.drawCharts()
            })
        },

        setScreenSize: function() {
            var w = $(window).width()
            app.screenSize = (w > 1200) ? 4 : (w > 992) ? 3 : (w > 600) ? 2 : 1
            // 1 = small, 2 = medium, 3 = large, 4 = xlarge
        },
		
		drawCharts: function(mod) {
            Vue.nextTick(function() {
                app.drawPieChart();
				
            })
        },
		
		drawPieChart: function() {
				
			
            // apply data
            var data = google.visualization.arrayToDataTable([
				['Contributor', 'Total Dollars'],
				['Total Salary (City)', app.hoursTotal], 
				['Total Benefits (City)', app.benefitsTotal], 
				['Total Deductions (Employee)', app.empTtl],
				['Total Taxes (Employee)', app.taxTotal],
				['Medicare Match (City)', app.taxTotalMedicare]
			]);

            // chart options
            var options = {
                title: 'Total Compensation Breakdown' //+app.thisFY.yr,
            };

            // draw chart
            var chart = new google.visualization.PieChart(document.getElementById('piePortion'))
            chart.draw(data, options);
			
        },
		
		 // format numbers with commas and two decimal places
        format: function(num, round) {
            if (isNaN(num)) return -1
            if (round === undefined) round = 2
            return Number(num).toFixed(round).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') // looks crazy..adds comma into numbers
        }
		
	
	}
		
		
		
})
		
		
		
		
		
       
