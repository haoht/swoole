<?php
namespace App\Home\Controller;
use Itxiao6\Upload\Exception\UploadException;
use Service\Exception;
use Service\Upload;
use Service\Verify;

/**
 * 用户操作类
 * Class User
 * @package App\Home\Controller
 */
class User extends Base
{
    public function __init()
    {
        parent::__init(); // TODO: Change the autogenerated stub
        if(isset($_SESSION['home']['user']['id']) && $_SESSION['home']['user']['id']!='' && $_SESSION['home']['user']['id'] > 0){

        }else{
            $this -> redirect('User.login');
        }
    }

    # 我的帖子
    public function index()
    {
        return $this -> display();
    }
    # 基本设置
    public function set()
    {
        if(IS_POST){
            try{
                # 修改资料
                \App\Model\User::set_info($_POST,function($user){
                    $_SESSION['home']['user'] = $user -> toArray();
                });
                $this -> ajaxReturn(['status'=>0,'msg'=>'修改成功']);
            }catch (\Exception $exception){
                $this -> ajaxReturn(['status'=>1,'msg'=>$exception -> getMessage()]);
            }
        }else{
            # 渲染模板
            return $this -> display();
        }
    }
    # 我的消息
    public function message()
    {
        return $this -> display();
    }
    # 激活邮箱
    public function activate()
    {
        return $this -> display();
    }
    # 找回密码/重置密码
    public function forget()
    {
        return $this -> display();
    }
    # 用户主页
    public function home()
    {
        return $this -> display();
    }
    # 上传头像
    public function upload()
    {
        try{
            # 上传成功的图片url
            $data['url'] = Upload::upload('headimg',function($file){
                # 验证规则
                if($file['size'] > 5000){
                    throw new UploadException('文件尺寸大于5M');
                }
            });
            # 状态 0 = 成功
            $data['status'] = 0;
            # 返回信息
            $this -> ajaxReturn($data);
        }catch (\Itxiao6\Upload\Exception\UploadException $exception){
            # 获取错误信息
            $data['msg'] = $exception -> getMessage();
            # 状态 1 = 失败
            $data['status'] = 1;
            # 返回信息
            $this -> ajaxReturn($data);
        }
    }
}