/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, ElementRef, Injector, NgModule, destroyPlatform} from '@angular/core';
import {async} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import * as angular from '@angular/upgrade/src/common/angular1';
import {UpgradeComponent, UpgradeModule, downgradeComponent} from '@angular/upgrade/static';

import {bootstrap, html} from '../test_helpers';

export function main() {
  describe('content projection', () => {

    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should instantiate ng2 in ng1 template and project content', async(() => {

         // the ng2 component that will be used in ng1 (downgraded)
         @Component({selector: 'ng2', template: `{{ prop }}(<ng-content></ng-content>)`})
         class Ng2Component {
           prop = 'NG2';
           ngContent = 'ng2-content';
         }

         // our upgrade module to host the component to downgrade
         @NgModule({
           imports: [BrowserModule, UpgradeModule],
           declarations: [Ng2Component],
           entryComponents: [Ng2Component]
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         // the ng1 app module that will consume the downgraded component
         const ng1Module = angular
                               .module('ng1', [])
                               // create an ng1 facade of the ng2 component
                               .directive('ng2', downgradeComponent({component: Ng2Component}))
                               .run(($rootScope: angular.IRootScopeService) => {
                                 $rootScope['prop'] = 'NG1';
                                 $rootScope['ngContent'] = 'ng1-content';
                               });

         const element = html('<div>{{ \'ng1[\' }}<ng2>~{{ ngContent }}~</ng2>{{ \']\' }}</div>');

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
           expect(document.body.textContent).toEqual('ng1[NG2(~ng1-content~)]');
         });
       }));

    it('should instantiate ng1 in ng2 template and project content', async(() => {

         @Component({
           selector: 'ng2',
           template: `{{ 'ng2(' }}<ng1>{{ transclude }}</ng1>{{ ')' }}`,
         })
         class Ng2Component {
           prop = 'ng2';
           transclude = 'ng2-transclude';
         }

         @Directive({selector: 'ng1'})
         class Ng1WrapperComponent extends UpgradeComponent {
           constructor(elementRef: ElementRef, injector: Injector) {
             super('ng1', elementRef, injector);
           }
         }

         @NgModule({
           declarations: [Ng1WrapperComponent, Ng2Component],
           entryComponents: [Ng2Component],
           imports: [BrowserModule, UpgradeModule]
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const ng1Module =
             angular.module('ng1', [])
                 .directive('ng1', () => ({
                                     transclude: true,
                                     template: '{{ prop }}(<ng-transclude></ng-transclude>)'
                                   }))
                 .directive('ng2', downgradeComponent({component: Ng2Component}))
                 .run(($rootScope: angular.IRootScopeService) => {
                   $rootScope['prop'] = 'ng1';
                   $rootScope['transclude'] = 'ng1-transclude';
                 });

         const element = html('<div>{{ \'ng1(\' }}<ng2></ng2>{{ \')\' }}</div>');

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
           expect(document.body.textContent).toEqual('ng1(ng2(ng1(ng2-transclude)))');
         });
       }));
  });
}
