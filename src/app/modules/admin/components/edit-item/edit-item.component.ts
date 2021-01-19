import {Component, OnInit, Output, EventEmitter } from '@angular/core';
import {AngularEditorConfig} from "@kolkov/angular-editor";
import {ActivatedRoute} from "@angular/router";
import {SubjectService} from "../../../../services/subject.service";
import {UnitService} from "../../../../services/unit.service";
import {ExerciseService} from "../../../../services/exercise.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {TranslateService} from "@ngx-translate/core";
import Utils from "../../../../utils";


@Component({
  selector: 'app-new-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.sass']
})
export class EditItemComponent implements OnInit {

  id;
  item;
  currentService;
  fields;
  data;
  htmlContent = '';

  config: AngularEditorConfig = {
    editable: true,
    minHeight: '5rem',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['bold']
    ],
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  };

  form: FormGroup;
  formControlsArray = [];

  constructor(
    public route: ActivatedRoute,
    public subjectService: SubjectService,
    public unitService: UnitService,
    public exerciseService: ExerciseService,
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) {
    this.form = this._formBuilder.group({
      formControlsArray: this._formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.item = params.get('item');
      switch (this.item){
        case 'subjects':
          this.currentService = this.subjectService;
          break;
        case 'units':
          this.currentService = this.unitService;
          break;
        case 'exercises':
          this.currentService = this.exerciseService;
          break;
      }

      if(params.get('id')) {
        this.id = params.get('id');
      }

      this.currentService.getOne(this.id).subscribe(details => {
        this.data = details;

        this.fields = Utils.internalFieldsfilter(Object.keys(details))

        for(let field of this.fields){
          //create form controls dinamically:
          let formc = this._formBuilder.control(
            {
              value: this.data[field],
              disabled: field === 'id'
            }, Validators.required);

          this.formControlsArray.push(formc);
          this.form.addControl(field, formc);
        }
        console.log(this.fields)
        console.log(this.formControlsArray)
      });


    });
  }

  submit(){
    //edit
    const values = this.form.value;

    this.currentService.edit(this.id, values).subscribe(response =>{
      console.log(response);
      this.toastr.success(this.translateService.instant('EDITED'));
    });

  }

}