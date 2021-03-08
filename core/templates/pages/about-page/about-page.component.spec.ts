// Copyright 2020 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for the about page.
 */

import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { EventEmitter, Pipe } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AboutPageComponent } from './about-page.component';
import { I18nLanguageCodeService } from 'services/i18n-language-code.service';
import { LoaderService } from 'services/loader.service';
import { SiteAnalyticsService } from 'services/site-analytics.service';
import { TranslateService } from 'services/translate.service';
import { UrlInterpolationService } from
  'domain/utilities/url-interpolation.service';
import { UserInfo } from 'domain/user/user-info.model';
import { UserService } from 'services/user.service';
import { WindowDimensionsService } from
  'services/contextual/window-dimensions.service';
import { WindowRef } from 'services/contextual/window-ref.service';

@Pipe({name: 'translate'})
class MockTranslatePipe {
  transform(value: string, params: Object | undefined):string {
    return value;
  }
}

class MockTranslateService {
  languageCode = 'es';
  use(newLanguageCode: string): string {
    this.languageCode = newLanguageCode;
    return this.languageCode;
  }
}

class MockI18nLanguageCodeService {
  codeChangeEventEmiiter = new EventEmitter<string>();
  getCurrentI18nLanguageCode() {
    return 'en';
  }

  get onI18nLanguageCodeChange() {
    return this.codeChangeEventEmiiter;
  }
}

describe('About Page', () => {
  const siteAnalyticsService = new SiteAnalyticsService(
    new WindowRef());
  let loaderService: LoaderService = null;
  let userService: UserService;
  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [AboutPageComponent, MockTranslatePipe],
      providers: [
        {
          provide: I18nLanguageCodeService,
          useClass: MockI18nLanguageCodeService
        },
        {
          provide: WindowDimensionsService,
          useValue: {
            isWindowNarrow: () => true
          }
        },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: SiteAnalyticsService, useValue: siteAnalyticsService },
        UrlInterpolationService,
        {
          provide: WindowRef,
          useValue: {
            nativeWindow: {
              location: {
                href: ''
              }
            }
          }
        }
      ]
    }).compileComponents();
  });
  beforeEach(angular.mock.module('oppia'));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    loaderService = TestBed.get(LoaderService);
    userService = TestBed.get(UserService);
    const aboutPageComponent = TestBed.createComponent(AboutPageComponent);
    component = aboutPageComponent.componentInstance;
  });
  let component = null;

  it('should successfully instantiate the component',
    () => {
      expect(component).toBeDefined();
      component.ngOnInit();
    });

  it('should return correct static image url when calling getStaticImageUrl',
    () => {
      expect(component.getStaticImageUrl('/path/to/image')).toBe(
        '/assets/images/path/to/image');
    });

  // eslint-disable-next-line max-len
  it('should redirect guest user to the login page when they click create lesson button',
    fakeAsync(() => {
      const userInfoBackendDict = {
        is_moderator: false,
        is_admin: false,
        is_super_admin: false,
        is_topic_manager: false,
        can_create_collections: false,
        preferred_site_language_code: null,
        username: '',
        email: '',
        user_is_logged_in: null
      };
      spyOn(userService, 'getUserInfoAsync').and.returnValue(Promise.resolve(
        UserInfo.createFromBackendDict(userInfoBackendDict))
      );
      component.ngOnInit();
      flushMicrotasks();
      expect(component.userIsLoggedIn).toBe(null);
      spyOn(
        siteAnalyticsService, 'registerCreateLessonButtonEvent')
        .and.callThrough();
      component.onClickCreateLessonButton();

      expect(siteAnalyticsService.registerCreateLessonButtonEvent)
        .toHaveBeenCalledWith();
      expect(component.loginUrl).toBe('/_ah/login');
    }));

  it('should set component properties when ngOnInit() is called', () => {
    component.ngOnInit();

    expect(component.userIsLoggedIn).toBe(false);
    expect(component.classroomUrl).toBe('/learn/math');
    expect(component.loginUrl).toBe('/_ah/login');
  });

  it('should show and hide loading screen with the correct text', () =>
    fakeAsync(() => {
      component.ngOnInit();
      spyOn(loaderService, 'showLoadingScreen').and.callThrough();
      expect(loaderService.showLoadingScreen)
        .toHaveBeenCalledWith('Loading');
    }));

  it('should set the correct value for the userIsLoggedIn property',
    fakeAsync(() => {
      const UserInfoObject = {
        is_moderator: false,
        is_admin: false,
        is_super_admin: false,
        is_topic_manager: false,
        can_create_collections: true,
        preferred_site_language_code: null,
        username: 'tester',
        email: 'test@test.com',
        user_is_logged_in: true
      };
      spyOn(userService, 'getUserInfoAsync').and.returnValue(Promise.resolve(
        UserInfo.createFromBackendDict(UserInfoObject))
      );

      component.ngOnInit();
      flushMicrotasks();

      expect(component.userIsLoggedIn).toBe(true);
    }));

  it('should activate Visit Classroom button when clicked', function() {
    spyOn(
      siteAnalyticsService, 'registerClickVisitClassroomButtonEvent')
      .and.callThrough();
    component.onClickVisitClassroomButton();

    expect(siteAnalyticsService.registerClickVisitClassroomButtonEvent)
      .toHaveBeenCalledWith();
  });

  it('should activate Browse Library button when clicked', function() {
    spyOn(
      siteAnalyticsService, 'registerClickBrowseLibraryButtonEvent')
      .and.callThrough();

    component.onClickBrowseLibraryButton();

    expect(siteAnalyticsService.registerClickBrowseLibraryButtonEvent)
      .toHaveBeenCalledWith();
  });

  it('should activate Create Lesson button when clicked', function() {
    spyOn(
      siteAnalyticsService, 'registerCreateLessonButtonEvent')
      .and.callThrough();

    component.onClickCreateLessonButton();

    expect(siteAnalyticsService.registerCreateLessonButtonEvent)
      .toHaveBeenCalledWith();
  });

  it('should activate Guide For Teacher button when clicked', function() {
    spyOn(
      siteAnalyticsService, 'registerClickGuideForTeacherButtonEvent')
      .and.callThrough();

    component.onClickGuideForTeacherButton();

    expect(siteAnalyticsService.registerClickGuideForTeacherButtonEvent)
      .toHaveBeenCalledWith();
  });

  it('should activate Tip For Parent button when clicked', function() {
    spyOn(
      siteAnalyticsService, 'registerClickTipforParentsButtonEvent')
      .and.callThrough();

    component.onClickTipForParentsButton();

    expect(siteAnalyticsService.registerClickTipforParentsButtonEvent)
      .toHaveBeenCalledWith();
  });
});
