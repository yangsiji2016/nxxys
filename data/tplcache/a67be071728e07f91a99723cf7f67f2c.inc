{dede:noteinfo notename="多栏目" channelid="1" macthtype="string"
    refurl="http://www.81xiyou.com/a/xiyouzixun/shichanggonggao/2016/1008/17.html" sourcelang="utf-8" cosort="asc"
  isref="no" exptime="10" usemore="1" /}
{dede:listrule sourcetype="batch" rssurl="http://" regxurl="(#)"
startid="1" endid="14" addv="1" urlrule="area" musthas=""
 nothas="" listpic="1" usemore="1"}
    {dede:addurls}http://www.81xiyou.com/a/xiyouzixun/zhongxindongtai/list_9_(*).html{/dede:addurls}
    {dede:batchrule}[(#)=>http://www.81xiyou.com/a/xiyouzixun/huiyuanhuodong/list_10_(*).html; (*)=1-2; typeid=>19]
[(#)=>http://www.81xiyou.com/a/xiyouzixun/tuoguangonggao/list_11_(*).html; (*)=1-5; typeid=>20]{/dede:batchrule}
    {dede:regxrule}{/dede:regxrule}
    {dede:areastart}<ul class="list">{/dede:areastart}
    {dede:areaend}</ul>{/dede:areaend}
{/dede:listrule}
{dede:sppage sptype='full' srul='1' erul='5'}{/dede:sppage}
{dede:previewurl}http://www.81xiyou.com/a/xiyouzixun/shichanggonggao/2016/1118/378.html{/dede:previewurl}
{dede:keywordtrim}{/dede:keywordtrim}
{dede:descriptiontrim}{/dede:descriptiontrim}
{dede:item field='title' value='' isunit='' isdown=''}
   {dede:match}<div class="nDTitle">[内容]</div>{/dede:match}
   
   {dede:function}{/dede:function}
{/dede:item}{dede:item field='writer' value='' isunit='' isdown=''}
   {dede:match}{/dede:match}
   
   {dede:function}{/dede:function}
{/dede:item}{dede:item field='source' value='' isunit='' isdown=''}
   {dede:match};来源：[内容];{/dede:match}
   
   {dede:function}{/dede:function}
{/dede:item}{dede:item field='pubdate' value='' isunit='' isdown=''}
   {dede:match}<div class="nDInfos">发布时间：[内容];{/dede:match}
   
   {dede:function}{/dede:function}
{/dede:item}{dede:item field='body' value='' isunit='1' isdown='1'}
   {dede:match}<div class="nDContent">[内容]</div>{/dede:match}
   
   {dede:function}{/dede:function}
{/dede:item}