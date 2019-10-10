﻿angular.module("app.core").controller("RejectReportModalInstanceController", [
   "$scope", "$modalInstance", "itemId", "NotificationService", function ($scope, $modalInstance, itemId, NotificationService) {

       $scope.itemId = itemId;

       $scope.result = {};


       $scope.noClicked = function () {
           $modalInstance.dismiss('cancel');
           NotificationService.AutoFadeNotification("warning", "", "Afvisning af indberetningen blev annulleret.");
       }

       $scope.yesClicked = function () {
           if ($scope.comment == undefined) {
               $scope.errorMessage = "* Du skal angive en kommentar.";
           } else {
               $scope.result.Comment = $scope.comment;
               $scope.result.Id = itemId;
               $modalInstance.close($scope.result);
           }
       }
   }
]);
