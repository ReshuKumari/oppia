// Copyright 2019 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Component for the MultipleChoiceInput short response.
 *
 * IMPORTANT NOTE: The naming convention for customization args that are passed
 * into the Ccmponent is: the name of the parameter, followed by 'With',
 * followed by the name of the arg.
 */

import { Component, Input, OnInit } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';
import { ConvertToPlainTextPipe } from 'filters/string-utility-filters/convert-to-plain-text.pipe';
import { TruncateAtFirstLinePipe } from 'filters/string-utility-filters/truncate-at-first-line.pipe';
import { HtmlEscaperService } from 'services/html-escaper.service';

@Component({
  selector: 'oppia-short-response-multiple-choice-input',
  templateUrl: './multiple-choice-input-short-response.component.html'
})
export class ShortResponseMultipleChoiceInputComponent implements OnInit {
  @Input() answer;
  @Input() choices;
  response;

  constructor(
    private htmlEscaperService: HtmlEscaperService,
    private convertToPlainText: ConvertToPlainTextPipe,
    private truncateAtFirstLine: TruncateAtFirstLinePipe
  ) { }

  ngOnInit(): void {
    const _answer = this.htmlEscaperService.escapedJsonToObj(
      this.answer) as string;
    var _choices = this.htmlEscaperService.escapedJsonToObj(this.choices);
    var yieldAllValuesOf = function*(_choices) {
      yield* _choices;
    };
    var choice = [];
    for (let elem of yieldAllValuesOf(_choices)) {
      choice.push(elem.html);
    }
    _choices = choice;
    const response = this.convertToPlainText.transform(_choices[_answer]);
    this.response = this.truncateAtFirstLine.transform(response);
  }
}

angular.module('oppia').directive(
  'oppiaShortResponseMultipleChoiceInput',
  downgradeComponent({
    component: ShortResponseMultipleChoiceInputComponent
  }));
