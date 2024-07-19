import { Component, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-globe',
  standalone: true,
  imports: [],
  templateUrl: './globe.component.html',
  styleUrls: ['./globe.component.scss'],
})
export class GlobeComponent implements AfterViewInit {
  constructor() {}

  ngAfterViewInit(): void {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      projection: 'globe',
      zoom: 2.0,
      center: [-90, 40],
      accessToken:
        'pk.eyJ1IjoiYXNhZGFsaTEzMTAyIiwiYSI6ImNscndoZGg2czB2YTAyam5hY2U2eDVlYXAifQ.-spKATyM4-Xyucde1wHBbg',
    });

    map.on('style.load', () => {
      map.setFog({});
    });

    const secondsPerRevolution = 120;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    let spinEnabled = true;

    const spinGlobe = () => {
      const zoom = map.getZoom();
      if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.getCenter();
        center.lng -= distancePerSecond;
        map.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    };

    map.on('mousedown', () => {
      userInteracting = true;
    });
    map.on('mouseup', () => {
      userInteracting = false;
      spinGlobe();
    });
    map.on('dragend', () => {
      userInteracting = false;
      spinGlobe();
    });
    map.on('pitchend', () => {
      userInteracting = false;
      spinGlobe();
    });
    map.on('rotateend', () => {
      userInteracting = false;
      spinGlobe();
    });
    map.on('moveend', () => {
      spinGlobe();
    });

    document.getElementById('btn-spin')!.addEventListener('click', (e) => {
      spinEnabled = !spinEnabled;
      const target = e.target as HTMLButtonElement;
      if (spinEnabled) {
        spinGlobe();
        target.innerHTML = 'Pause rotation';
      } else {
        map.stop();
        target.innerHTML = 'Start rotation';
      }
    });

    // Function to generate random coordinates
    // const generateRandomCoordinates = (num: number) => {
    //   const coordinates = [];
    //   for (let i = 0; i < num; i++) {
    //     const lat = Math.random() * 180 - 90;
    //     const lng = Math.random() * 360 - 180;
    //     coordinates.push({ lng, lat });
    //   }
    //   return coordinates;
    // };

    const generateRandomCoordinates = (num: number) => {
      const coordinates = [];
      const minLat = 24;
      const maxLat = 37;
      const minLng = 60;
      const maxLng = 77;
    
      for (let i = 0; i < num; i++) {
        const lat = Math.random() * (maxLat - minLat) + minLat;
        const lng = Math.random() * (maxLng - minLng) + minLng;
        coordinates.push({ lng, lat });
      }
    
      return coordinates;
    };
    

    // Generate 1000 random coordinates
    const randomCoordinates = generateRandomCoordinates(1000);

    // Convert locations to GeoJSON
    const geojson= {
      type: 'FeatureCollection',
      features: randomCoordinates.map((coord) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [coord.lng, coord.lat] as [number, number],
        },
      })),
    };

    map.on('load', () => {
      map.loadImage(
        '../../assets/marker-icon.png',
        (error, image) => {
          if (error) throw error;

          // Add the image to the map style.
          map.addImage('mark', image!);

          // Add GeoJSON source with clustering
          map.addSource('locations', {
            type: 'geojson',
            data: geojson,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          });

          // Add cluster layer
          map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'locations',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1',
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40,
              ],
            },
          });

          // Add cluster count layer
          map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'locations',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12,
            },
          });

          // Add unclustered point layer
          map.addLayer({
            id: 'unclustered-point',
            type: 'symbol',
            source: 'locations',
            filter: ['!', ['has', 'point_count']],
            layout: {
              'icon-image': 'mark', // reference the image
              'icon-size': 0.05
          }
          });
        }
      );
    });

    spinGlobe();
  }
}
