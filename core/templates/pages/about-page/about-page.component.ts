// Copyright 2016 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Component for the about page.
 */

import { Component, OnInit } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';

import { UrlInterpolationService } from
  'domain/utilities/url-interpolation.service.ts';
import { WindowRef } from
  'services/contextual/window-ref.service.ts';
import { SiteAnalyticsService } from 'services/site-analytics.service';
import { UserService } from 'services/user.service';
import { LoaderService } from 'services/loader.service.ts';
import splashConstants from 'assets/constants';

@Component({
  selector: 'about-page',
  templateUrl: './about-page.component.html'
})
export class AboutPageComponent implements OnInit {
  classroomUrlFragment: string;
  classroomUrl :string;
  userIsLoggedIn: boolean | null;
  constructor(
    private urlInterpolationService: UrlInterpolationService,
    private windowRef: WindowRef,
    private siteAnalyticsService: SiteAnalyticsService,
    private userService: UserService,
    private loaderService: LoaderService) {
  }

  getStaticImageUrl(imagePath: string): string {
    return this.urlInterpolationService.getStaticImageUrl(imagePath);
  }

  onClickVisitClassroomButton(): void {
    this.siteAnalyticsService.registerClickVisitClassroomButtonEvent();
    setTimeout(() => {
      this.windowRef.nativeWindow.location.href = this.classroomUrl;
    }, 150);
    return;
  }

  onClickBrowseLibraryButton(): void {
    this.siteAnalyticsService.
      registerClickBrowseLibraryButtonEvent();
    setTimeout(
      () => this.windowRef.nativeWindow.location.href =
       '/community-library', 150);
    return;
  }

  onClickCreateLessonButton(): void {
    this.siteAnalyticsService.registerCreateLessonButtonEvent();
    if (this.userIsLoggedIn === null) {
      setTimeout(() => window.location.replace('/_ah/login'), 150);
    } else {
      setTimeout(() => window.location.replace(
        '/creator-dashboard?mode=create'), 150);
    }
    return;
  }

  onClickGuideForTeacherButton(): void {
    this.siteAnalyticsService.registerClickGuideForTeacherButtonEvent();
    setTimeout(() => {
      this.windowRef.nativeWindow.location.href = '/teach';
    }, 150);
    return;
  }

  onClickTipsForParentsButton(): void {
    this.siteAnalyticsService.registerClickTipforParentsButtonEvent();
    setTimeout(() => {
      this.windowRef.nativeWindow.location.href = '/teach';
    }, 150);
    return;
  }

  ngOnInit(): void {
    this.userIsLoggedIn = null;
    this.classroomUrl = this.urlInterpolationService.interpolateUrl(
      '/learn/<classroomUrlFragment>', {
        classroomUrlFragment: splashConstants.DEFAULT_CLASSROOM_URL_FRAGMENT
      });
    this.loaderService.showLoadingScreen('Loading');
    this.userService.getUserInfoAsync().then((userInfo) => {
      this.userIsLoggedIn = userInfo.isLoggedIn();
      this.loaderService.hideLoadingScreen();
    });
  }
}
angular.module('oppia').directive(
  'aboutPage', downgradeComponent({component: AboutPageComponent}));
