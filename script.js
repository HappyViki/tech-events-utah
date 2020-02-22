var L, $

const styles = {
  happyviki: 'happyviki/ck6pgh3u51i3o1iqufyayel7n',
  streets: 'mapbox/streets-v11',
  satellite: 'mapbox/satellite-v9'
}

const groupHandles = [
  'UtahJS',
  'DowntownCodingSLC',
  '801labs',
  'Girl-Develop-It-Salt-Lake-City',
  'Women-Who-Code-SLC'
]


const myMarkers = {}
const noVenue = []

const mymap = L.map('map').setView([40.75, -111.88], 12)

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: styles.streets,
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiaGFwcHl2aWtpIiwiYSI6ImNrNjhlaG5qYTA0NGwzb21tYW12dWNvNjYifQ.Xfgk0ONllxtreRZooz5NPg'
}).addTo(mymap)

const setMeetupMarker = (meetupEvent) => {
  const id = meetupEvent.venue.name
  const coordinates = [meetupEvent.venue.lat, meetupEvent.venue.lon]

  if (myMarkers[id]) {
    myMarkers[id].eventData.push(meetupEvent)
  } else {
    myMarkers[id] = {}
    myMarkers[id].eventData = [meetupEvent]
    myMarkers[id].eventObj = L.marker(coordinates).addTo(mymap)
    // console.log(Object.values(markerData).length,locationID);
  }
}

const showDetails = (location,eventIndex) => {
  const currentDetails = location === "noVenue" ?
  noVenue[eventIndex] :
  myMarkers[location].eventData[eventIndex]
  $("#detailsContainer").html(`<a href="currentDetails.link"><h2>${currentDetails.name}</h2></a>${currentDetails.description}`)
}

const setAllMarkerPopups = () => {
  const popupEventTemplate = `{{date}}
    <a href="{{link}}" title="{{name}}">
    {{trimmedName}}</a>
    <button onclick="showDetails({{data}})">Details</button>`

  $.each(myMarkers, function (location, myMarker) {
    const popupHeaderText = `<b>${location}</b><br>`
    const popupEventData = myMarker.eventData.slice(0,3)

    const popupBodyText = popupEventData.map((item,index)=>{
      const date = item.local_date
      const link = item.link
      const name = item.name
      const trimmedName = item.name.length > 20 ? item.name.slice(0,20).trim() + "..." : item.name

      return popupEventTemplate
      .replace("{{data}}",`'${location}',${index}`)
      .replace("{{date}}",date)
      .replace("{{link}}",link)
      .replace("{{name}}",name)
      .replace("{{trimmedName}}",trimmedName)

    }).join('<br>')

    myMarker.eventObj.bindPopup(popupHeaderText + popupBodyText)
  })
}

$(document).ready(function () {
  requests = []
  $.each(groupHandles, function (index, groupHandle) {
      requests[index] = $.ajax({
        url: `https://api.meetup.com/${groupHandle}/events`,
        dataType: 'jsonp',
        success: function (json) {
          //console.log(json)
          const groupEvents = json.data
          $.each(groupEvents, function (index, meetupEvent) {
            if (meetupEvent.venue) {
              setMeetupMarker(meetupEvent)
            } else {
              noVenue.push(meetupEvent)
            }
          })
        },
        error: function (error) {
          console.log('there was an error loading meetup api')
        }
      })
  })

  $.when(...requests).then(()=>{
    setAllMarkerPopups()
    $("#noVenue").html(noVenue.map((item,index)=>{
      return `<li>${item.name} <button onclick="showDetails('noVenue',${index})">Details</button></li>`;
    }))
  })
})
