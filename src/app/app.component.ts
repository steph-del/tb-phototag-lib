import { Component } from '@angular/core';

import { PhotoTag } from 'projects/tb-phototag-lib/src/lib/_models/phototag.model';
import { TbLog } from 'projects/tb-phototag-lib/src/lib/_models/tb-log.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public basicTags = [
    {path: 'Organes', name: 'Fleur', id: null, userId: null},
    {path: 'Organes', name: 'Feuille', id: null, userId: null},
    {path: 'Organes', name: 'Fruit', id: null, userId: null},
    {path: 'Organes', name: 'Port', id: null, userId: null},
    {path: 'Organes', name: 'Écorce', id: null, userId: null},
    {path: 'Organes', name: 'Rameau', id: null, userId: null},
    {path: 'Organes', name: 'Graine', id: null, userId: null},
    {path: 'Organes', name: 'Bourgeon', id: null, userId: null},
    {path: 'Organes', name: 'Cotylédon', id: null, userId: null},
    {path: 'Organes', name: 'Organe souterrain', id: null, userId: null},
    {path: 'Photo', name: 'Scan', id: null, userId: null},
    {path: 'Photo', name: 'Planche', id: null, userId: null},
    {path: 'Photo', name: 'Dessin', id: null, userId: null},
    {path: 'Morphologie', name: 'Plantule', id: null, userId: null},
    {path: 'Morphologie', name: 'Rosette', id: null, userId: null},
  ];

  log(log: TbLog) {
    if (log.type === 'info') {
      // tslint:disable-next-line:no-console
      console.info(log.message_fr);
    } else if (log.type === 'success') {
      console.log(log.message_fr);
    } else if (log.type === 'warning') {
      console.warn(log.message_fr);
    } else if (log.type === 'error') {
      console.error(log.message_fr);
    }
  }
}
