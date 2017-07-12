// #docplaster
// #docregion v1
import { Component, OnInit } from '@angular/core';

// #enddocregion v1
// #docregion hero-detail-import
import { Hero } from '../hero';
// #enddocregion hero-detail-import

// #docregion v1
@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
  // #enddocregion v1
// #docregion v1
})
export class HeroDetailComponent implements OnInit{
// #enddocregion v1
// #docregion hero
  hero: Hero;
// #enddocregion hero
// #docregion v1
  constructor() { }

  ngOnInit() {
  }
}
// #enddocregion v1