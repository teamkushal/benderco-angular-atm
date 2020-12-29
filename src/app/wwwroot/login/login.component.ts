import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AtmHistoryService } from 'src/app/services/atm-history/atm-history.service';
import { ShowHideInput } from 'src/app/directives/show-hide-input.directive';
import { TransactionHistoryType, UserType } from 'src/app/enum/index.enum';
import { UserStateService } from 'src/app/services/user-state/user-state.service';
import { IUser } from 'src/app/interface/user.interface';
import { TransactionHistory } from 'src/app/class/transaction-history';
import { ErrorStateMatcher } from '@angular/material/core';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    private _currentUser: IUser;

    public password: string = null;
    public show: boolean = false;
    public userName: string = null;
    public loginForm: FormGroup;

    public get currentUser() { return this._currentUser };

    @ViewChild(ShowHideInput) input: ShowHideInput;
    constructor(
        private atmHistoryService: AtmHistoryService,
        private router: Router,
        private userStateService: UserStateService
    ) { }

    ngOnInit(): void {
        this.loginForm = new FormGroup({
            userName: new FormControl(null, Validators.required),
            password: new FormControl(null, Validators.required)
        });
    }

    public processLogin(): void {
        this.userName = this.loginForm.controls['userName'].value;
        this.password = this.loginForm.controls['password'].value;
        this._currentUser = this.userStateService.processLogin(this.userName, this.password)

        this.logHistory();

        this.loginForm.controls['userName'].setValue(null);
        this.loginForm.controls['password'].setValue(null);

        if (!!this._currentUser) {
            this.processLoginRouting();
        }
    }

    public toggleShow() {
        this.show = !this.show;
        if (this.show) {
            this.input.changeType("text");
        }
        else {
            this.input.changeType("password");
        }
    }

    private logHistory(): void {
        this.atmHistoryService.addHistory(new TransactionHistory({
            userId: !!this._currentUser ? this._currentUser.id : undefined,
            type: TransactionHistoryType[TransactionHistoryType.login],
            message: 'Attempt to Login of ' + this.userName + ((!!this._currentUser) ? ' was successful' : ' failed, invalid Username/Password')
        }));
    }

    private processLoginRouting(): void {
        switch (this._currentUser.userType) {
            case UserType.basic: {
                this.router.navigate(['user-landing']);
                break;
            }
            case UserType.admin: {
                this.router.navigate(['admin-landing']);
                break;
            }
            case UserType.super: {
                this.router.navigate(['super-landing']);
                break;
            }
        }
    }

    emailFormControl = new FormControl('', [
        Validators.required,
        Validators.email,
    ]);

    matcher = new MyErrorStateMatcher();
}
